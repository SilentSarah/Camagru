<?php

require_once __DIR__ . '/Core/MigrationManager.php';

// Usage: php rollback.php [steps]

$steps = isset($argv[1]) ? (int)$argv[1] : 1;

if ($steps < 1) {
    echo "Error: Steps must be a positive integer\n";
    exit(1);
}

$migrationsDir = __DIR__ . '/migrations';
if (!is_dir($migrationsDir)) {
    echo "Error: Migrations directory not found\n";
    exit(1);
}

try {
    $manager = new MigrationManager($migrationsDir);
    $manager->rollback($steps);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
