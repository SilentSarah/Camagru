# PHP String Functions and Manipulation

## String Functions Used in Our Migration System

Our migration system uses several string functions to process names, create slugs, and manipulate SQL. Let's explore them!

## String Basics

### Creating Strings

```php
$name = "John";
$greeting = 'Hello';
$multiline = "Hello
World";
```

### String Concatenation

```php
$first = "Hello";
$last = "World";

// Using dot operator
$full = $first . " " . $last;  // "Hello World"

// Using double quotes (variable interpolation)
$full = "$first $last";  // "Hello World"
```

## Functions We Use

### 1. strtolower()

Converts string to lowercase:

```php
$text = "HELLO WORLD";
$lower = strtolower($text);  // "hello world"
```

**In our code:**

```php
$slug = strtolower($text);  // "Add Description" → "add description"
```

### 2. preg_replace()

Replaces text using regular expressions:

```php
$text = "Hello, World! How are you?";
$clean = preg_replace('/[^a-z0-9]+/i', '_', $text);
// "Hello_World_How_are_you_"
```

**Pattern breakdown:**

- `/[^a-z0-9]+/i` - Regular expression pattern
- `[^a-z0-9]` - Match anything NOT a letter or number
- `+` - One or more times
- `i` - Case insensitive
- `_` - Replace with underscore

**In our code:**

```php
private function slugify(string $text): string {
    $text = preg_replace('/[^a-z0-9]+/i', '_', strtolower($text));
    return trim($text, '_');
}

// "Add Description Field" → "add_description_field"
```

### 3. trim()

Removes whitespace (or other characters) from start/end:

```php
$text = "  hello  ";
$trimmed = trim($text);  // "hello"

$text = "__hello__";
$trimmed = trim($text, '_');  // "hello"
```

**In our code:**

```php
return trim($text, '_');  // Remove underscores from ends
// "_add_description_" → "add_description"
```

### 4. str_ends_with() (PHP 8.0+)

Checks if string ends with substring:

```php
$filename = "photo.jpg";
if (str_ends_with($filename, '.jpg')) {
    echo "It's a JPEG!";
}
```

**In our code:**

```php
if (str_ends_with($propertyName, '_at')) {
    $sqlType = 'DATETIME';
}
// "created_at" ends with "_at" → DATETIME type
```

### 5. implode()

Joins array elements into string:

```php
$parts = ['apple', 'banana', 'orange'];
$result = implode(', ', $parts);
// "apple, banana, orange"
```

**In our code:**

```php
$columnDefs = ['id INT', 'name VARCHAR(255)', 'age INT'];
$sql = implode(",\n    ", $columnDefs);
// "id INT,
//  name VARCHAR(255),
//  age INT"
```

### 6. explode()

Splits string into array:

```php
$text = "apple,banana,orange";
$parts = explode(',', $text);
// ['apple', 'banana', 'orange']
```

### 7. strtoupper()

Converts to uppercase:

```php
$text = "hello";
$upper = strtoupper($text);  // "HELLO"
```

**In our code:**

```php
$existingType = strtoupper($existing['type']);  // "int" → "INT"
$newType = strtoupper($info['type']);           // "int" → "INT"
```

### 8. basename()

Gets filename from path:

```php
$path = "/home/user/photo.jpg";
$filename = basename($path);  // "photo.jpg"

$filename = basename($path, '.jpg');  // "photo"
```

**In our code:**

```php
$className = basename($file, '.php');
// "/path/to/Photo.php" → "Photo"
```

### 9. pathinfo()

Gets information about file path:

```php
$path = "/home/user/photo.jpg";
$info = pathinfo($path);

// Result:
[
    'dirname' => '/home/user',
    'basename' => 'photo.jpg',
    'extension' => 'jpg',
    'filename' => 'photo'
]

// Get just extension:
$ext = pathinfo($path, PATHINFO_EXTENSION);  // "jpg"
```

**In our code:**

```php
if (pathinfo($migration, PATHINFO_EXTENSION) === 'sql') {
    // It's a .sql file
}
```

## String Interpolation

### Double Quotes

Variables are replaced:

```php
$name = "John";
$age = 25;

echo "Hello, $name! You are $age years old.";
// "Hello, John! You are 25 years old."
```

### Curly Braces

For complex expressions:

```php
$user = ['name' => 'John'];

echo "Hello, {$user['name']}!";
// "Hello, John!"
```

**In our code:**

```php
$sql = "INSERT INTO {$this->table} ($cols) VALUES ($vals)";
// "INSERT INTO photos (id, name) VALUES (?, ?)"
```

### Single Quotes

Variables are NOT replaced:

```php
$name = "John";
echo 'Hello, $name!';
// "Hello, $name!" (literal)
```

## Heredoc and Nowdoc

### Heredoc (like double quotes)

```php
$name = "John";
$text = <<<EOT
Hello, $name!
This is a multi-line string.
Variables work here.
EOT;
```

### Nowdoc (like single quotes)

```php
$text = <<<'EOT'
Hello, $name!
Variables don't work here.
EOT;
```

## Regular Expressions Basics

### Pattern Syntax

```php
/pattern/flags
```

**Common patterns:**

- `.` - Any character
- `*` - Zero or more
- `+` - One or more
- `?` - Zero or one
- `[abc]` - Match a, b, or c
- `[^abc]` - Match anything except a, b, or c
- `[a-z]` - Match any lowercase letter
- `[0-9]` - Match any digit
- `\d` - Match digit (same as [0-9])
- `\w` - Match word character (a-z, A-Z, 0-9, \_)

**Common flags:**

- `i` - Case insensitive
- `m` - Multiline
- `s` - Dot matches newline

### Examples

```php
// Match email
preg_match('/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i', $email);

// Match phone number
preg_match('/^\d{3}-\d{3}-\d{4}$/', $phone);

// Replace multiple spaces with one
preg_replace('/\s+/', ' ', $text);
```

## String Functions in Our Migration System

### Creating Migration Names

```php
private function slugify(string $text): string {
    // 1. Convert to lowercase
    $text = strtolower($text);
    // "Add Description Field" → "add description field"

    // 2. Replace non-alphanumeric with underscore
    $text = preg_replace('/[^a-z0-9]+/i', '_', $text);
    // "add description field" → "add_description_field"

    // 3. Remove underscores from ends
    return trim($text, '_');
    // "_add_description_field_" → "add_description_field"
}
```

### Building SQL Statements

```php
// Join column definitions
$columnDefs = ['id INT', 'name VARCHAR(255)'];
$sql = "CREATE TABLE users (\n    "
     . implode(",\n    ", $columnDefs)
     . "\n)";

// Result:
// CREATE TABLE users (
//     id INT,
//     name VARCHAR(255)
// )
```

### Detecting Special Fields

```php
// Check if field name ends with "_at"
if (str_ends_with($propertyName, '_at')) {
    $sqlType = 'DATETIME';
}

// Check if field is a content field
if (in_array($propertyName, ['content', 'description', 'message'])) {
    $sqlType = 'TEXT';
}
```

## Practical Examples

### Example 1: Creating Timestamps

```php
$timestamp = date('YmdHis');  // "20251121183000"
$description = "add description field";
$slug = $this->slugify($description);  // "add_description_field"

$migrationName = "{$timestamp}_{$slug}";
// "20251121183000_add_description_field"
```

### Example 2: Building File Paths

```php
$migrationsDir = "/path/to/migrations";
$migrationName = "20251121183000_add_description";

$migrationPath = $migrationsDir . '/' . $migrationName;
// "/path/to/migrations/20251121183000_add_description"

$upFile = $migrationPath . '/up.sql';
// "/path/to/migrations/20251121183000_add_description/up.sql"
```

### Example 3: Parsing File Extensions

```php
$filename = "001_initial_schema.sql";

$extension = pathinfo($filename, PATHINFO_EXTENSION);
// "sql"

if ($extension === 'sql') {
    echo "It's a SQL file!";
}
```

## String Comparison

### Case-Sensitive

```php
$a = "hello";
$b = "HELLO";

$a === $b;  // false
$a == $b;   // false
```

### Case-Insensitive

```php
$a = "hello";
$b = "HELLO";

strcasecmp($a, $b) === 0;  // true
strtolower($a) === strtolower($b);  // true
```

## Common String Operations

### Check if string contains substring

```php
$text = "Hello World";

// PHP 8.0+
str_contains($text, "World");  // true

// Older PHP
strpos($text, "World") !== false;  // true
```

### Check if string starts with

```php
$text = "Hello World";

// PHP 8.0+
str_starts_with($text, "Hello");  // true

// Older PHP
strpos($text, "Hello") === 0;  // true
```

### Get string length

```php
$text = "Hello";
$length = strlen($text);  // 5
```

### Get substring

```php
$text = "Hello World";
$sub = substr($text, 0, 5);  // "Hello"
$sub = substr($text, 6);     // "World"
```

### Replace substring

```php
$text = "Hello World";
$new = str_replace("World", "PHP", $text);
// "Hello PHP"
```

## Summary

1. **strtolower()** - Convert to lowercase
2. **strtoupper()** - Convert to uppercase
3. **trim()** - Remove whitespace from ends
4. **implode()** - Join array into string
5. **explode()** - Split string into array
6. **preg_replace()** - Replace using regex
7. **str_ends_with()** - Check if ends with substring
8. **str_starts_with()** - Check if starts with substring
9. **basename()** - Get filename from path
10. **pathinfo()** - Get path information

## Further Reading

- [PHP String Functions](https://www.php.net/manual/en/ref.strings.php)
- [PHP Regular Expressions](https://www.php.net/manual/en/book.pcre.php)
- [PHP String Operators](https://www.php.net/manual/en/language.operators.string.php)

---

**Next:** Check out `php-arrays.md` to learn about array manipulation!
