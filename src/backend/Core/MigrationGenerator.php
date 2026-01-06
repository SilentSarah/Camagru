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

class MigrationGenerator
{
    private SchemaInspector $inspector;
    private ModelParser $parser;

    public function __construct()
    {
        $this->inspector = new SchemaInspector();
        $this->parser = new ModelParser();
    }

    /**
     * Generate migration for a model
     * @param string $modelClass
     * @param string $description
     * @return array ['up' => string, 'down' => string, 'name' => string]
     */
    public function generateMigration(string $modelClass, string $description = ''): array
    {
        $modelSchema = $this->parser->parseModel($modelClass);
        $tableName = $modelSchema['table'];
        $modelColumns = $modelSchema['columns'];

        $upSql = '';
        $downSql = '';

        if (!$this->inspector->tableExists($tableName)) {

            [$upSql, $downSql] = $this->generateCreateTable($tableName, $modelColumns);
        } else {

            $dbSchema = $this->inspector->getTableSchema($tableName);
            [$upSql, $downSql] = $this->generateAlterTable($tableName, $modelColumns, $dbSchema);
        }


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
    private function generateCreateTable(string $tableName, array $columns): array
    {
        $columnDefs = [];

        foreach ($columns as $name => $info) {
            $def = "$name {$info['type']}";
            if (!$info['nullable']) {
                $def .= " NOT NULL";
            }
            if (!empty($info['extra'])) {
                $def .= " {$info['extra']}";
            }
            if (array_key_exists('default', $info) && $info['default'] !== null) {
                $defaultVal = $this->formatDefaultValue($info['default'], $info['type']);
                $def .= " DEFAULT $defaultVal";
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
    private function generateAlterTable(string $tableName, array $modelColumns, array $dbSchema): array
    {
        $upStatements = [];
        $downStatements = [];


        $existingColumns = [];
        foreach ($dbSchema as $col) {
            $existingColumns[$col['name']] = $col;
        }


        foreach ($modelColumns as $name => $info) {
            if (!isset($existingColumns[$name])) {

                $def = "{$info['type']}";
                if (!$info['nullable']) {
                    $def .= " NOT NULL";
                }
                if (array_key_exists('default', $info) && $info['default'] !== null) {
                    $defaultVal = $this->formatDefaultValue($info['default'], $info['type']);
                    $def .= " DEFAULT $defaultVal";
                }
                $upStatements[] = "ALTER TABLE $tableName ADD COLUMN $name $def;";
                $downStatements[] = "ALTER TABLE $tableName DROP COLUMN $name;";
            } else {

                $existing = $existingColumns[$name];
                $existingType = strtoupper($existing['type']);
                $newType = strtoupper($info['type']);


                if ($this->typesAreDifferent($existing, $info)) {
                    $def = "{$info['type']}";
                    if (!$info['nullable']) {
                        $def .= " NOT NULL";
                    }
                    if (array_key_exists('default', $info) && $info['default'] !== null) {
                        $defaultVal = $this->formatDefaultValue($info['default'], $info['type']);
                        $def .= " DEFAULT $defaultVal";
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
    /**
     * Check if types or defaults are different
     */
    private function typesAreDifferent(array $dbColumn, array $modelColumn): bool
    {
        $dbType = strtoupper(preg_replace('/\(.*\)/', '', $dbColumn['type']));
        $modelType = strtoupper(preg_replace('/\(.*\)/', '', $modelColumn['type']));


        if ($dbType === 'TINYINT' && $modelType === 'BOOLEAN') {
            $dbType = 'BOOLEAN';
        }

        if ($dbType !== $modelType) {
            return true;
        }


        $dbDefault = $dbColumn['default_value'];
        $modelDefault = $modelColumn['default'];


        if ($modelDefault !== null) {
            if (is_bool($modelDefault)) {
                $modelDefault = $modelDefault ? '1' : '0'; // MySQL stores bools as 1/0
            } elseif (is_string($modelDefault)) {
                $modelDefault = (string)$modelDefault;
            } else {
                $modelDefault = (string)$modelDefault;
            }
        }


        if ($dbDefault !== null) {
            // MySQL might return 'NULL' string for null default in some versions/configs, but usually returns null
            // It might also return defaults as strings even for numbers
        }


        if ($dbDefault === null && $modelDefault !== null) return true;
        if ($dbDefault !== null && $modelDefault === null) return true;
        if ($dbDefault === null && $modelDefault === null) return false;

        return (string)$dbDefault !== (string)$modelDefault;
    }

    /**
     * Convert string to slug
     */
    private function slugify(string $text): string
    {
        $text = preg_replace('/[^a-z0-9]+/i', '_', strtolower($text));
        return trim($text, '_');
    }

    /**
     * Format default value for SQL
     * @param mixed $value
     * @param string $type
     * @return string
     */
    private function formatDefaultValue(mixed $value, string $type): string
    {
        if (is_bool($value)) {
            return $value ? 'TRUE' : 'FALSE';
        }
        if (is_string($value)) {
            return "'$value'";
        }
        if (is_null($value)) {
            return 'NULL';
        }
        return (string)$value;
    }
}
