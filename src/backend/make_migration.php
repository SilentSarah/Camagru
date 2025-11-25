<?php

require_once __DIR__ . '/Core/MigrationGenerator.php';

// Usage: php make_migration.php ModelName "description"

if ($argc < 2) {
    echo "Usage: php make_migration.php ModelName [description]\n";
    echo "Example: php make_migration.php Photo \"add description field\"\n";
    exit(1);
}

$modelName = $argv[1];
$description = $argv[2] ?? "update_" . strtolower($modelName);

// Load the model
$modelFile = __DIR__ . '/Models/' . $modelName . '.php';
if (!file_exists($modelFile)) {
    echo "Error: Model file not found: $modelFile\n";
    exit(1);
}

require_once $modelFile;

if (!class_exists($modelName)) {
    echo "Error: Model class $modelName not found\n";
    exit(1);
}

try {
    $generator = new MigrationGenerator();
    $migration = $generator->generateMigration($modelName, $description);
    
    // Create migration directory
    $migrationsDir = __DIR__ . '/migrations';
    if (!is_dir($migrationsDir)) {
        mkdir($migrationsDir, 0777, true);
    }
    
    $migrationDir = $migrationsDir . '/' . $migration['name'];
    if (!is_dir($migrationDir)) {
        mkdir($migrationDir, 0777, true);
    }
    
    // Write up.sql
    $upFile = $migrationDir . '/up.sql';
    file_put_contents($upFile, $migration['up']);
    
    // Write down.sql
    $downFile = $migrationDir . '/down.sql';
    file_put_contents($downFile, $migration['down']);
    
    echo "✓ Migration created: {$migration['name']}\n";
    echo "  Location: $migrationDir\n";
    echo "\nUP SQL:\n";
    echo "-------\n";
    echo $migration['up'] . "\n\n";
    echo "DOWN SQL:\n";
    echo "---------\n";
    echo $migration['down'] . "\n\n";
    echo "Review the migration files and run 'php migrate.php' to apply.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
