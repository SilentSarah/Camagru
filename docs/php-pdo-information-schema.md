# PHP PDO and INFORMATION_SCHEMA

## What is INFORMATION_SCHEMA?

`INFORMATION_SCHEMA` is a **database within MySQL** that contains metadata about all your other databases. Think of it as a "database about databases" - it stores information about:

- What tables exist
- What columns are in each table
- What data types columns have
- What indexes exist
- What foreign keys exist

## Why Use INFORMATION_SCHEMA?

Instead of manually tracking your database structure, you can **query** it:

```php
// Instead of remembering what columns exist:
// "Does photos table have a description column?"

// Query INFORMATION_SCHEMA to find out:
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'photos';
```

This is exactly how our `SchemaInspector` works!

## PDO Basics

### What is PDO?

**PDO** (PHP Data Objects) is PHP's way to talk to databases. It provides a consistent interface whether you're using MySQL, PostgreSQL, SQLite, etc.

### Basic PDO Usage

```php
// Connect to database
$pdo = new PDO(
    "mysql:host=127.0.0.1;dbname=CAMAGRU",
    "ROOT",
    "ROOT"
);

// Execute a query
$stmt = $pdo->query("SELECT * FROM users");

// Get results
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

### PDO in Our Project

We use a singleton pattern in `Database.php`:

```php
class Database {
    private static $instance = null;

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new PDO($dsn, $username, $password);
        }
        return self::$instance;
    }
}

// Usage:
$pdo = Database::getInstance();
```

**Why singleton?** We only want **one** database connection for the entire application.

## INFORMATION_SCHEMA Tables

### Key Tables We Use

1. **TABLES** - Information about tables
2. **COLUMNS** - Information about columns
3. **KEY_COLUMN_USAGE** - Information about foreign keys

### 1. INFORMATION_SCHEMA.TABLES

Contains information about all tables:

```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'CAMAGRU';
```

**Result:**

```
+-------------+
| TABLE_NAME  |
+-------------+
| users       |
| photos      |
| likes       |
| comments    |
+-------------+
```

### 2. INFORMATION_SCHEMA.COLUMNS

Contains information about all columns:

```sql
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'CAMAGRU'
  AND TABLE_NAME = 'photos';
```

**Result:**

```
+-------------+-----------+-------------+----------------+
| COLUMN_NAME | DATA_TYPE | IS_NULLABLE | COLUMN_DEFAULT |
+-------------+-----------+-------------+----------------+
| id          | int       | NO          | NULL           |
| user_id     | int       | NO          | NULL           |
| image_path  | varchar   | NO          | NULL           |
| created_at  | datetime  | YES         | CURRENT_TIMESTAMP |
+-------------+-----------+-------------+----------------+
```

### 3. INFORMATION_SCHEMA.KEY_COLUMN_USAGE

Contains information about foreign keys:

```sql
SELECT
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'CAMAGRU'
  AND TABLE_NAME = 'photos'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Result:**

```
+-------------+-----------------------+------------------------+
| COLUMN_NAME | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
+-------------+-----------------------+------------------------+
| user_id     | users                 | id                     |
+-------------+-----------------------+------------------------+
```

## How We Use INFORMATION_SCHEMA

### SchemaInspector::getAllTables()

```php
public function getAllTables(): array {
    $dbName = DB_NAME;  // 'CAMAGRU'

    $stmt = $this->pdo->query("
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = '$dbName'
        AND TABLE_NAME != 'migrations'
    ");

    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}
```

**What this does:**

1. Queries `INFORMATION_SCHEMA.TABLES`
2. Filters by our database name
3. Excludes the `migrations` table
4. Returns array of table names: `['users', 'photos', 'likes', ...]`

### SchemaInspector::getTableSchema()

```php
public function getTableSchema(string $tableName): array {
    $dbName = DB_NAME;

    $stmt = $this->pdo->prepare("
        SELECT
            COLUMN_NAME as name,
            DATA_TYPE as type,
            COLUMN_TYPE as full_type,
            IS_NULLABLE as nullable,
            COLUMN_DEFAULT as default_value,
            COLUMN_KEY as key_type,
            EXTRA as extra
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
    ");

    $stmt->execute([$dbName, $tableName]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
```

**What this does:**

1. Queries `INFORMATION_SCHEMA.COLUMNS`
2. Gets detailed info about each column
3. Returns array of column information

**Example result for 'photos' table:**

```php
[
    [
        'name' => 'id',
        'type' => 'int',
        'full_type' => 'int(11)',
        'nullable' => 'NO',
        'default_value' => null,
        'key_type' => 'PRI',
        'extra' => 'auto_increment'
    ],
    [
        'name' => 'user_id',
        'type' => 'int',
        'full_type' => 'int(11)',
        'nullable' => 'NO',
        'default_value' => null,
        'key_type' => 'MUL',
        'extra' => ''
    ],
    // ... more columns
]
```

## PDO Fetch Modes

### FETCH_ASSOC

Returns associative array (keys are column names):

```php
$stmt = $pdo->query("SELECT id, name FROM users");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Result:
[
    'id' => 1,
    'name' => 'John'
]
```

### FETCH_COLUMN

Returns single column as array:

```php
$stmt = $pdo->query("SELECT name FROM users");
$names = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Result:
['John', 'Jane', 'Bob']
```

### FETCH_ALL vs FETCH

```php
// fetch() - Get ONE row
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// fetchAll() - Get ALL rows
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

## Prepared Statements

### Why Use Prepared Statements?

**Security!** Prevents SQL injection attacks.

### Bad (SQL Injection Vulnerable)

```php
$tableName = $_GET['table'];  // User input!
$sql = "SELECT * FROM $tableName";  // DANGEROUS!
$stmt = $pdo->query($sql);
```

**Attack:** User sends `table=users; DROP TABLE users;--`

### Good (Safe)

```php
$tableName = $_GET['table'];
$sql = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$tableName]);
```

**How it works:**

1. `prepare()` - Prepares SQL with placeholders (`?`)
2. `execute()` - Safely inserts values
3. PDO escapes dangerous characters automatically

### Named Placeholders

You can also use named placeholders:

```php
$sql = "SELECT * FROM users WHERE id = :id AND name = :name";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':id' => 1,
    ':name' => 'John'
]);
```

## Column Information Details

### DATA_TYPE vs COLUMN_TYPE

```php
// DATA_TYPE: Base type
'type' => 'int'

// COLUMN_TYPE: Full definition
'full_type' => 'int(11)'
```

```php
// DATA_TYPE: Base type
'type' => 'varchar'

// COLUMN_TYPE: Full definition with length
'full_type' => 'varchar(255)'
```

### IS_NULLABLE

```php
'nullable' => 'YES'  // Column allows NULL
'nullable' => 'NO'   // Column does NOT allow NULL
```

### COLUMN_KEY

```php
'key_type' => 'PRI'  // Primary key
'key_type' => 'MUL'  // Foreign key or index
'key_type' => 'UNI'  // Unique key
'key_type' => ''     // No key
```

### EXTRA

```php
'extra' => 'auto_increment'  // Auto-incrementing column
'extra' => ''                // No special behavior
```

## Practical Example: Detecting Changes

Here's how we detect if a column was added:

```php
// Get current database schema
$dbSchema = $inspector->getTableSchema('photos');
// Result: [
//     ['name' => 'id', ...],
//     ['name' => 'user_id', ...],
//     ['name' => 'image_path', ...],
//     ['name' => 'created_at', ...]
// ]

// Get model schema (from PHP class)
$modelSchema = $parser->parseModel('Photo');
// Result: [
//     'id' => [...],
//     'user_id' => [...],
//     'image_path' => [...],
//     'description' => [...],  ← NEW!
//     'created_at' => [...]
// ]

// Compare: 'description' is in model but not in database
// → Generate: ALTER TABLE photos ADD COLUMN description TEXT;
```

## Error Handling with PDO

### Set Error Mode

```php
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
```

This makes PDO throw exceptions on errors.

### Catching Errors

```php
try {
    $stmt = $pdo->query("SELECT * FROM nonexistent_table");
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
```

## Common INFORMATION_SCHEMA Queries

### Get all tables in database

```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'CAMAGRU';
```

### Get all columns in a table

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'CAMAGRU'
  AND TABLE_NAME = 'users';
```

### Get all foreign keys

```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'CAMAGRU'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Check if table exists

```sql
SELECT COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'CAMAGRU'
  AND TABLE_NAME = 'photos';
-- Returns 1 if exists, 0 if not
```

## How Our Migration System Uses This

### Step 1: Read Database Schema

```php
$inspector = new SchemaInspector();
$dbColumns = $inspector->getTableSchema('photos');
```

### Step 2: Read Model Schema

```php
$parser = new ModelParser();
$modelColumns = $parser->parseModel('Photo');
```

### Step 3: Compare

```php
$generator = new MigrationGenerator();
$migration = $generator->generateMigration('Photo', 'description');
```

### Step 4: Generate SQL

```php
// If column in model but not in DB:
ALTER TABLE photos ADD COLUMN description TEXT;

// If column in DB but not in model:
ALTER TABLE photos DROP COLUMN old_field;

// If type changed:
ALTER TABLE photos MODIFY COLUMN name VARCHAR(100);
```

## Summary

1. **INFORMATION_SCHEMA** is a database containing metadata
2. **PDO** is PHP's database interface
3. **Prepared statements** prevent SQL injection
4. **FETCH_ASSOC** returns associative arrays
5. **FETCH_COLUMN** returns single column
6. We use INFORMATION_SCHEMA to **inspect current database schema**
7. We compare it with **model schema** to detect changes

## Further Reading

- [MySQL INFORMATION_SCHEMA](https://dev.mysql.com/doc/refman/8.0/en/information-schema.html)
- [PHP PDO Documentation](https://www.php.net/manual/en/book.pdo.php)
- [PDO Prepared Statements](https://www.php.net/manual/en/pdo.prepared-statements.php)

---

**Next:** Check out `php-string-functions.md` to learn about string manipulation in PHP!
