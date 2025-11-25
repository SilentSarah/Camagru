<?php
/*
 *   ██████  ▄▄▄       ██▀███   ▄▄▄       ██░ ██ 
 * ▒██    ▒ ▒████▄    ▓██ ▒ ██▒▒████▄    ▓██░ ██▒
 * ░ ▓██▄   ▒██  ▀█▄  ▓██ ░▄█ ▒▒██  ▀█▄  ▒██▀▀██░
 *   ▒   ██▒░██▄▄▄▄██ ▒██▀▀█▄  ░██▄▄▄▄██ ░▓█ ░██ 
 * ▒██████▒▒ ▓█   ▓██▒░██▓ ▒██▒ ▓█   ▓██▒░▓█▒░██▓
 * ▒ ▒▓▒ ▒ ░ ▒▒   ▓▒█░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒ ░░▒░▒
 * ░ ░▒  ░ ░  ▒   ▒▒ ░  ░▒ ░ ▒░  ▒   ▒▒ ░ ▒ ░▒░ ░
 *  ░  ░  ░    ░   ▒     ░░   ░   ░   ▒    ░  ░░ ░
 * ░        ░  ░   ░           ░  ░ ░  ░  ░
 *                                       
 * File Created: Friday, 21st November 2025 6:32:21 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . '/SchemaInspector.php';
require_once __DIR__ . '/ModelParser.php';

class MigrationGenerator {
    private SchemaInspector $inspector;
    private ModelParser $parser;

    public function __construct() {
        $this->inspector = new SchemaInspector();
        $this->parser = new ModelParser();
    }

    /**
     * Generate migration for a model
     * @param string $modelClass
     * @param string $description
     * @return array ['up' => string, 'down' => string, 'name' => string]
     */
    public function generateMigration(string $modelClass, string $description = ''): array {
        $modelSchema = $this->parser->parseModel($modelClass);
        $tableName = $modelSchema['table'];
        $modelColumns = $modelSchema['columns'];

        $upSql = '';
        $downSql = '';

        if (!$this->inspector->tableExists($tableName)) {
            // Generate CREATE TABLE
            [$upSql, $downSql] = $this->generateCreateTable($tableName, $modelColumns);
        } else {
            // Generate ALTER TABLE
            $dbSchema = $this->inspector->getTableSchema($tableName);
            [$upSql, $downSql] = $this->generateAlterTable($tableName, $modelColumns, $dbSchema);
        }

        // Generate migration name
        $timestamp = date('YmdHis');
        $slug = $this->slugify($description ?: "update_$tableName");
        $migrationName = "{$timestamp}_{$slug}";

        return [
            'name' => $migrationName,
            'up' => $upSql,
            'down' => $downSql
        ];
    }

    /**
     * Generate CREATE TABLE SQL
     * @param string $tableName
     * @param array $columns
     * @return array [up, down]
     */
    private function generateCreateTable(string $tableName, array $columns): array {
        $columnDefs = [];
        
        foreach ($columns as $name => $info) {
            $def = "$name {$info['type']}";
            if (!$info['nullable']) {
                $def .= " NOT NULL";
            }
            if (!empty($info['extra'])) {
                $def .= " {$info['extra']}";
            }
            $columnDefs[] = $def;
        }

        $upSql = "CREATE TABLE IF NOT EXISTS $tableName (\n    " 
               . implode(",\n    ", $columnDefs) 
               . "\n);";
        
        $downSql = "DROP TABLE IF EXISTS $tableName;";

        return [$upSql, $downSql];
    }

    /**
     * Generate ALTER TABLE SQL
     * @param string $tableName
     * @param array $modelColumns
     * @param array $dbSchema
     * @return array [up, down]
     */
    private function generateAlterTable(string $tableName, array $modelColumns, array $dbSchema): array {
        $upStatements = [];
        $downStatements = [];

        // Create a map of existing columns
        $existingColumns = [];
        foreach ($dbSchema as $col) {
            $existingColumns[$col['name']] = $col;
        }

        // Check for new columns
        foreach ($modelColumns as $name => $info) {
            if (!isset($existingColumns[$name])) {
                // Add column
                $def = "{$info['type']}";
                if (!$info['nullable']) {
                    $def .= " NOT NULL";
                }
                $upStatements[] = "ALTER TABLE $tableName ADD COLUMN $name $def;";
                $downStatements[] = "ALTER TABLE $tableName DROP COLUMN $name;";
            } else {
                // Check if type changed
                $existing = $existingColumns[$name];
                $existingType = strtoupper($existing['type']);
                $newType = strtoupper($info['type']);
                
                // Normalize types for comparison
                if ($this->typesAreDifferent($existingType, $newType, $existing['full_type'], $info['type'])) {
                    $def = "{$info['type']}";
                    if (!$info['nullable']) {
                        $def .= " NOT NULL";
                    }
                    $upStatements[] = "ALTER TABLE $tableName MODIFY COLUMN $name $def;";
                    
                    $oldDef = "{$existing['full_type']}";
                    if ($existing['nullable'] === 'NO') {
                        $oldDef .= " NOT NULL";
                    }
                    $downStatements[] = "ALTER TABLE $tableName MODIFY COLUMN $name $oldDef;";
                }
            }
        }

        // Check for removed columns
        foreach ($existingColumns as $name => $info) {
            if (!isset($modelColumns[$name]) && $name !== 'id') {
                $upStatements[] = "ALTER TABLE $tableName DROP COLUMN $name;";
                
                $def = "{$info['full_type']}";
                if ($info['nullable'] === 'NO') {
                    $def .= " NOT NULL";
                }
                $downStatements[] = "ALTER TABLE $tableName ADD COLUMN $name $def;";
            }
        }

        if (empty($upStatements)) {
            return ["-- No changes detected for table $tableName", "-- No rollback needed"];
        }

        $upSql = implode("\n", $upStatements);
        $downSql = implode("\n", array_reverse($downStatements));

        return [$upSql, $downSql];
    }

    /**
     * Check if types are different
     */
    private function typesAreDifferent(string $dbType, string $modelType, string $fullDbType, string $fullModelType): bool {
        // Normalize for comparison
        $dbType = strtoupper(preg_replace('/\(.*\)/', '', $dbType));
        $modelType = strtoupper(preg_replace('/\(.*\)/', '', $modelType));
        
        // Handle TINYINT as BOOLEAN
        if ($dbType === 'TINYINT' && $modelType === 'BOOLEAN') {
            return false;
        }
        
        return $dbType !== $modelType;
    }

    /**
     * Convert string to slug
     */
    private function slugify(string $text): string {
        $text = preg_replace('/[^a-z0-9]+/i', '_', strtolower($text));
        return trim($text, '_');
    }
}
