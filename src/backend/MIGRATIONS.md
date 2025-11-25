# Auto-Migration System Documentation

## Overview

The Camagru project now includes a powerful auto-migration system that automatically detects changes in your model classes and generates SQL migration files. This system supports both forward migrations (applying changes) and rollbacks (reverting changes).

## Features

✅ **Auto-Detection**: Automatically detects schema changes from model properties  
✅ **Type Mapping**: Intelligently maps PHP types to SQL types  
✅ **Rollback Support**: Every migration includes both UP and DOWN SQL  
✅ **Batch Tracking**: Migrations are grouped into batches for organized rollbacks  
✅ **Backward Compatible**: Works with both old `.sql` files and new directory-based migrations

## Quick Start

### 1. Modify a Model

Add, remove, or change properties in your model class:

```php
class Photo extends AbstractModel {
    private int $id;
    private int $user_id;
    private string $image_path;
    private ?string $description = null;  // New field!
    private ?string $created_at = null;
}
```

### 2. Generate Migration

```bash
php src/backend/make_migration.php Photo "add description field"
```

This will:

- Analyze the Photo model
- Compare it with the current database schema
- Generate `up.sql` and `down.sql` files
- Display the generated SQL for review

### 3. Apply Migration

```bash
php src/backend/migrate.php
```

### 4. Rollback (if needed)

```bash
php src/backend/rollback.php 1  # Rollback last batch
```

## Type Mapping

The system automatically maps PHP types to SQL types:

| PHP Type                  | SQL Type                         | Notes                                           |
| ------------------------- | -------------------------------- | ----------------------------------------------- |
| `int`                     | `INT`                            |                                                 |
| `float`                   | `FLOAT`                          |                                                 |
| `bool`                    | `BOOLEAN`                        | Stored as TINYINT in MySQL                      |
| `string`                  | `VARCHAR(255)`                   | Default for strings                             |
| `string` (content fields) | `TEXT`                           | For `content`, `description`, `message`, `body` |
| `?type`                   | Allows `NULL`                    | Nullable types                                  |
| `*_at` suffix             | `DATETIME`                       | Auto-detected datetime fields                   |
| `id` property             | `INT AUTO_INCREMENT PRIMARY KEY` | Special handling                                |

## CLI Commands

### make_migration.php

Generate a new migration from model changes.

**Usage:**

```bash
php src/backend/make_migration.php ModelName "description"
```

**Arguments:**

- `ModelName` - Name of the model class (e.g., Photo, User, Comment)
- `description` - Optional description of the migration

**Example:**

```bash
php src/backend/make_migration.php Photo "add description and tags"
```

**Output:**

- Creates a directory: `migrations/YYYYMMDDHHMMSS_description/`
- Generates `up.sql` - SQL to apply changes
- Generates `down.sql` - SQL to revert changes
- Displays the SQL for review before applying

### migrate.php

Apply all pending migrations.

**Usage:**

```bash
php src/backend/migrate.php
```

**Behavior:**

- Checks which migrations have already been applied
- Applies only new migrations
- Groups migrations into batches
- Supports both old `.sql` files and new directory format

### rollback.php

Rollback migrations.

**Usage:**

```bash
php src/backend/rollback.php [steps]
```

**Arguments:**

- `steps` - Number of batches to rollback (default: 1)

**Examples:**

```bash
php src/backend/rollback.php      # Rollback last batch
php src/backend/rollback.php 2    # Rollback last 2 batches
```

## Migration File Structure

### New Format (Auto-Generated)

```
migrations/
  20251121173341_add_description_field/
    up.sql      # Forward migration
    down.sql    # Rollback migration
```

### Old Format (Still Supported)

```
migrations/
  001_initial_schema.sql
```

## How It Works

### 1. SchemaInspector

Reads the current database schema using `INFORMATION_SCHEMA`:

- Gets all tables and columns
- Retrieves column types, nullability, defaults
- Fetches foreign key constraints

### 2. ModelParser

Uses PHP Reflection to analyze model classes:

- Extracts private properties
- Reads type hints
- Infers SQL types from PHP types
- Detects special fields (id, \*\_at, content, etc.)

### 3. MigrationGenerator

Compares model schema with database schema:

- Detects new columns → generates `ADD COLUMN`
- Detects removed columns → generates `DROP COLUMN`
- Detects type changes → generates `MODIFY COLUMN`
- Detects new tables → generates `CREATE TABLE`
- Creates both UP and DOWN SQL

### 4. MigrationManager

Manages migration execution:

- Tracks applied migrations in `migrations` table
- Groups migrations into batches
- Applies migrations in order
- Supports rollback by batch

## Best Practices

### 1. Always Review Generated SQL

Before running `migrate.php`, review the generated SQL:

```bash
php src/backend/make_migration.php Photo "add field"
# Review the displayed SQL
# Check the files in migrations/TIMESTAMP_description/
php src/backend/migrate.php
```

### 2. Use Descriptive Migration Names

```bash
# Good
php src/backend/make_migration.php Photo "add description and tags"
php src/backend/make_migration.php User "add email verification"

# Less helpful
php src/backend/make_migration.php Photo "update"
```

### 3. One Change Per Migration

For clarity and easier rollback:

```bash
# Better
php src/backend/make_migration.php Photo "add description"
php src/backend/make_migration.php Photo "add tags"

# Harder to track
php src/backend/make_migration.php Photo "add multiple fields"
```

### 4. Test Rollbacks in Development

Always test that your rollback works:

```bash
php src/backend/migrate.php
# Test your changes
php src/backend/rollback.php 1
# Verify rollback worked
```

### 5. Backup Before Production Migrations

```bash
# Backup database
mysqldump -u ROOT -pROOT CAMAGRU > backup.sql

# Apply migration
php src/backend/migrate.php

# If something goes wrong
php src/backend/rollback.php 1
# or restore from backup
```

## Example Workflow

### Adding a New Field

1. **Update the model:**

```php
// Photo.php
private ?string $caption = null;

public function getCaption(): ?string { return $this->caption; }
public function setCaption(?string $caption): void { $this->caption = $caption; }
```

2. **Generate migration:**

```bash
php src/backend/make_migration.php Photo "add caption field"
```

Output:

```
✓ Migration created: 20251121180000_add_caption_field

UP SQL:
-------
ALTER TABLE photos ADD COLUMN caption VARCHAR(255);

DOWN SQL:
---------
ALTER TABLE photos DROP COLUMN caption;
```

3. **Apply migration:**

```bash
php src/backend/migrate.php
```

Output:

```
Applying migration: 20251121180000_add_caption_field
Applied migration: 20251121180000_add_caption_field
All migrations applied.
```

4. **Verify:**

```bash
mysql -u ROOT -pROOT -h 127.0.0.1 CAMAGRU -e "DESCRIBE photos;"
```

### Rolling Back

```bash
php src/backend/rollback.php 1
```

Output:

```
Rolling back batch 3...
Rolling back: 20251121180000_add_caption_field
Rolled back: 20251121180000_add_caption_field
```

## Limitations

### Current Limitations

1. **Foreign Keys**: Not auto-detected from models (add manually to migration)
2. **Indexes**: Not auto-generated (add manually if needed)
3. **Unique Constraints**: Not auto-detected (add manually)
4. **Default Values**: Not inferred from model properties

### Manual Additions

For complex constraints, edit the generated migration files:

```sql
-- up.sql
ALTER TABLE photos ADD COLUMN caption VARCHAR(255);
ALTER TABLE photos ADD INDEX idx_caption (caption);

-- down.sql
ALTER TABLE photos DROP INDEX idx_caption;
ALTER TABLE photos DROP COLUMN caption;
```

## Troubleshooting

### "Column not found: batch"

The migrations table needs updating:

```sql
ALTER TABLE migrations ADD COLUMN batch INT NOT NULL DEFAULT 0 AFTER migration;
UPDATE migrations SET batch = 1 WHERE batch = 0;
```

### "Model class not found"

Ensure the model file exists and the class name matches:

```bash
# Check file exists
ls src/backend/Models/Photo.php

# Check class name in file
grep "class Photo" src/backend/Models/Photo.php
```

### "No changes detected"

The model matches the database schema. If you expect changes:

1. Verify the property was added to the model
2. Check the property has a type hint
3. Ensure the table exists in the database

## Advanced Usage

### Creating Migrations for All Models

```bash
for model in Photo Like Comment Filter PhotoFilter Notification User; do
    php src/backend/make_migration.php $model "sync schema"
done
```

### Checking Migration Status

```bash
mysql -u ROOT -pROOT -h 127.0.0.1 CAMAGRU -e "SELECT * FROM migrations ORDER BY batch, id;"
```

### Manual Migration Creation

You can still create manual migrations:

```bash
mkdir -p src/backend/migrations/20251121180000_custom_change
echo "ALTER TABLE photos ADD COLUMN custom TEXT;" > src/backend/migrations/20251121180000_custom_change/up.sql
echo "ALTER TABLE photos DROP COLUMN custom;" > src/backend/migrations/20251121180000_custom_change/down.sql
```

## Summary

The auto-migration system provides a robust, Laravel-like migration experience for your PHP project. It automatically detects schema changes, generates migrations, and supports rollbacks - making database schema management much easier and safer.

**Key Benefits:**

- 🚀 Faster development - no manual SQL writing
- 🔒 Safer deployments - review before applying
- ↩️ Easy rollbacks - undo changes quickly
- 📝 Version controlled - migrations tracked in git
- 🔄 Team friendly - consistent schema across environments
