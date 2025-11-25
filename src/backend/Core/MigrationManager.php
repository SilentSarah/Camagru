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
 * File Created: Friday, 21st November 2025 5:24:50 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . '/Database.php';

class MigrationManager {
    private ?PDO $pdo;
    private string $migrationsDir;

    public function __construct(string $migrationsDir) {
        $this->pdo = Database::getInstance();
        if ($this->pdo == null) {
            throw new Exception("Migration failed: Database connection failed");
        } 
        
        $this->migrationsDir = $migrationsDir;
        $this->ensureMigrationsTable();
    }

    private function ensureMigrationsTable(): void {
        $sql = "CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            migration VARCHAR(255) NOT NULL,
            batch INT NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->pdo->exec($sql);
    }

    public function getAppliedMigrations(): array {
        $stmt = $this->pdo->query("SELECT migration FROM migrations ORDER BY id");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getCurrentBatch(): int {
        $stmt = $this->pdo->query("SELECT MAX(batch) as max_batch FROM migrations");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['max_batch'] ?? 0);
    }

    public function applyMigrations(): void {
        $appliedMigrations = $this->getAppliedMigrations();
        $files = $this->getMigrationFiles();
        $batch = $this->getCurrentBatch() + 1;

        $hasNewMigrations = false;

        foreach ($files as $migration) {
            if (!in_array($migration, $appliedMigrations)) {
                echo "Applying migration: $migration" . PHP_EOL;
                $this->applyMigration($migration, $batch);
                $hasNewMigrations = true;
            }
        }

        if (!$hasNewMigrations) {
            echo "No new migrations to apply." . PHP_EOL;
        } else {
            echo "All migrations applied." . PHP_EOL;
        }
    }

    private function applyMigration(string $migration, int $batch): void {
        $migrationPath = $this->migrationsDir . '/' . $migration;
        
        // Check if it's a directory (new format) or file (old format)
        if (is_dir($migrationPath)) {
            $upFile = $migrationPath . '/up.sql';
            if (!file_exists($upFile)) {
                throw new Exception("Up migration file not found: $upFile");
            }
            $sql = file_get_contents($upFile);
        } else if (is_file($migrationPath) && pathinfo($migration, PATHINFO_EXTENSION) === 'sql') {
            $sql = file_get_contents($migrationPath);
        } else {
            return; // Skip non-migration files
        }

        try {
            $this->pdo->exec($sql);
            $stmt = $this->pdo->prepare("INSERT INTO migrations (migration, batch) VALUES (?, ?)");
            $stmt->execute([$migration, $batch]);
            echo "Applied migration: $migration" . PHP_EOL;
        } catch (PDOException $e) {
            echo "Failed to apply migration $migration: " . $e->getMessage() . PHP_EOL;
            throw $e;
        }
    }

    public function rollback(int $steps = 1): void {
        $currentBatch = $this->getCurrentBatch();
        
        if ($currentBatch === 0) {
            echo "Nothing to rollback." . PHP_EOL;
            return;
        }

        $targetBatch = max(0, $currentBatch - $steps);
        
        for ($batch = $currentBatch; $batch > $targetBatch; $batch--) {
            $this->rollbackBatch($batch);
        }
    }

    private function rollbackBatch(int $batch): void {
        $stmt = $this->pdo->prepare("
            SELECT migration 
            FROM migrations 
            WHERE batch = ? 
            ORDER BY id DESC
        ");
        $stmt->execute([$batch]);
        $migrations = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($migrations)) {
            echo "No migrations found for batch $batch" . PHP_EOL;
            return;
        }

        echo "Rolling back batch $batch..." . PHP_EOL;

        foreach ($migrations as $migration) {
            $this->rollbackMigration($migration);
        }
    }

    private function rollbackMigration(string $migration): void {
        $migrationPath = $this->migrationsDir . '/' . $migration;
        
        // Check if it's a directory (new format)
        if (is_dir($migrationPath)) {
            $downFile = $migrationPath . '/down.sql';
            if (!file_exists($downFile)) {
                echo "Warning: Down migration file not found for $migration, skipping..." . PHP_EOL;
                // Still remove from migrations table
                $stmt = $this->pdo->prepare("DELETE FROM migrations WHERE migration = ?");
                $stmt->execute([$migration]);
                return;
            }
            $sql = file_get_contents($downFile);
        } else {
            echo "Warning: Cannot rollback old-format migration $migration (no down.sql)" . PHP_EOL;
            return;
        }

        try {
            echo "Rolling back: $migration" . PHP_EOL;
            $this->pdo->exec($sql);
            $stmt = $this->pdo->prepare("DELETE FROM migrations WHERE migration = ?");
            $stmt->execute([$migration]);
            echo "Rolled back: $migration" . PHP_EOL;
        } catch (PDOException $e) {
            echo "Failed to rollback migration $migration: " . $e->getMessage() . PHP_EOL;
            throw $e;
        }
    }

    private function getMigrationFiles(): array {
        $items = scandir($this->migrationsDir);
        $migrations = array_diff($items, ['.', '..']);
        sort($migrations);
        return array_values($migrations);
    }
}
