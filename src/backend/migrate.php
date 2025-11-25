<?php

require_once __DIR__ . '/Core/MigrationManager.php';

// Load environment variables if needed (assuming they are already loaded or handled in Database.php)
// In a real app, you might use dotenv here.

$migrationsDir = __DIR__ . '/migrations';
if (!is_dir($migrationsDir)) {
    mkdir($migrationsDir, 0777, true);
}

$manager = new MigrationManager($migrationsDir);
$manager->applyMigrations();
