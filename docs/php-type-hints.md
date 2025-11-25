# PHP Type Hints and Type System

## What are Type Hints?

Type hints (also called type declarations) let you specify what **type** of data a variable, parameter, or return value should be. This helps catch bugs early and makes code more readable.

## Why Use Type Hints?

1. **Catch errors early** - PHP will throw an error if wrong type is passed
2. **Better IDE support** - Auto-completion and suggestions
3. **Self-documenting code** - Clear what types are expected
4. **Refactoring safety** - Easier to change code without breaking things

## Basic Type Hints

### Property Type Hints (PHP 7.4+)

```php
class User {
    // Without type hints (old way)
    private $id;
    private $name;

    // With type hints (modern way)
    private int $id;
    private string $name;
    private float $balance;
    private bool $isActive;
}
```

### Parameter Type Hints

```php
// Without type hints
function greet($name) {
    return "Hello, $name";
}

// With type hints
function greet(string $name): string {
    return "Hello, $name";
}

// Now this will error:
greet(123); // TypeError: must be of type string, int given
```

### Return Type Hints

```php
function getAge(): int {
    return 25;
}

function getName(): string {
    return "John";
}

function isActive(): bool {
    return true;
}
```

## Built-in Types

### Scalar Types

```php
class Example {
    private int $age;           // Integer: 1, 2, 100, -5
    private float $price;       // Float: 1.5, 3.14, -0.5
    private string $name;       // String: "hello", "world"
    private bool $isActive;     // Boolean: true, false
}
```

### Special Types

```php
class Example {
    private array $items;       // Array: [1, 2, 3]
    private object $data;       // Any object
    private mixed $anything;    // Any type (PHP 8.0+)
    private void $nothing;      // No return value (functions only)
}
```

### Class Types

```php
class Photo {
    private User $owner;        // Must be a User object
    private DateTime $created;  // Must be a DateTime object
}

function savePhoto(Photo $photo): void {
    // $photo must be a Photo instance
}
```

## Nullable Types

Use `?` to allow `null` values:

```php
class Photo {
    private int $id;                    // Cannot be null
    private ?string $description;       // Can be null
    private ?DateTime $publishedAt;     // Can be null
}

// Example usage:
$photo = new Photo();
$photo->description = null;      // OK
$photo->description = "Hello";   // OK
$photo->id = null;              // ERROR! int cannot be null
```

### Nullable in Functions

```php
function findUser(int $id): ?User {
    // Returns User or null if not found
    return $user ?? null;
}

function setName(?string $name): void {
    // $name can be string or null
}
```

## Union Types (PHP 8.0+)

Allow multiple types:

```php
class Example {
    // Can be int OR string
    private int|string $id;

    // Can be array OR null
    private array|null $data;
}

function process(int|float $number): string|bool {
    // Accepts int or float
    // Returns string or bool
}
```

## Type Juggling vs Strict Types

### Default Behavior (Type Juggling)

PHP will try to convert types automatically:

```php
function add(int $a, int $b): int {
    return $a + $b;
}

add("5", "10");  // Works! Converts strings to ints → 15
add(5.7, 3.2);   // Works! Converts floats to ints → 8
```

### Strict Types

Add this at the **top of your file** to disable auto-conversion:

```php
<?php
declare(strict_types=1);

function add(int $a, int $b): int {
    return $a + $b;
}

add("5", "10");  // ERROR! Must be int, not string
add(5.7, 3.2);   // ERROR! Must be int, not float
```

**Note:** We don't use strict types in our project, so PHP will auto-convert when possible.

## How We Use Type Hints in Our Models

### Example: Photo Model

```php
class Photo extends AbstractModel {
    private int $id;                // Required integer
    private int $user_id;           // Required integer
    private string $image_path;     // Required string
    private ?string $description;   // Optional string (can be null)
    private ?string $created_at;    // Optional string (can be null)
}
```

### Why These Types?

- `int $id` - IDs are always integers, never null
- `int $user_id` - Foreign keys are integers
- `string $image_path` - File paths are strings
- `?string $description` - Description is optional (can be null)
- `?string $created_at` - Timestamp might not be set yet

## Reading Type Information with Reflection

This is how our `ModelParser` reads types:

```php
$property = $reflection->getProperty('description');
$type = $property->getType();

// Check if it's a named type (int, string, etc.)
if ($type instanceof ReflectionNamedType) {
    $typeName = $type->getName();     // "string"
    $nullable = $type->allowsNull();  // true (because of ?)
}
```

### Complete Example

```php
// Model property:
private ?string $description = null;

// Reflection analysis:
$type = $property->getType();
$type->getName();        // "string"
$type->allowsNull();     // true
$type->isBuiltin();      // true

// Our code converts this to SQL:
// description VARCHAR(255) NULL
```

## Type Hints in Method Signatures

### Getters

```php
public function getId(): int {
    return $this->id;
}

public function getDescription(): ?string {
    return $this->description;
}
```

**Why the difference?**

- `getId()` returns `int` - ID is never null
- `getDescription()` returns `?string` - description can be null

### Setters

```php
public function setId(int $id): void {
    $this->id = $id;
}

public function setDescription(?string $description): void {
    $this->description = $description;
}
```

**Return type `void`** means the method doesn't return anything.

## Array Type Hints

Arrays can have type hints, but only for the array itself:

```php
function getUsers(): array {
    return []; // Returns an array
}

function setTags(array $tags): void {
    // $tags must be an array
}
```

**Limitation:** You can't specify what's _inside_ the array:

```php
// This is NOT valid PHP:
private array<string> $tags;  // ❌ Not supported

// You can only do:
private array $tags;  // ✅ Any array
```

**Solution:** Use PHPDoc comments for documentation:

```php
/** @var string[] */
private array $tags;  // IDE knows it's array of strings
```

## Mixed Type (PHP 8.0+)

Explicitly allows any type:

```php
function process(mixed $data): mixed {
    // $data can be anything
    // Returns anything
}
```

This is useful when you genuinely need to accept any type.

## Common Patterns in Our Project

### Pattern 1: Required Fields

```php
private int $id;
private int $user_id;
private string $image_path;
```

These are **never null** - always have a value.

### Pattern 2: Optional Fields

```php
private ?string $description = null;
private ?string $created_at = null;
```

These **can be null** - optional data.

### Pattern 3: Default Values

```php
private bool $is_read = false;
private int $position_x = 0;
```

These have **default values** when object is created.

## Type Coercion in Our Code

When we save to database, PHP converts types:

```php
$data = [
    'user_id' => $this->user_id,      // int → "1"
    'is_read' => $this->is_read,      // bool → 0 or 1
    'description' => $this->description // ?string → null or "text"
];
```

MySQL receives:

- `int` as string: `"1"`
- `bool` as int: `0` or `1`
- `null` as `NULL`

## Best Practices

### ✅ DO

```php
// Use type hints everywhere
private int $id;
public function getId(): int { }

// Use nullable for optional fields
private ?string $description;

// Use void for methods that don't return
public function save(): void { }
```

### ❌ DON'T

```php
// Don't omit type hints
private $id;  // What type is this?

// Don't use mixed unless necessary
private mixed $data;  // Too vague

// Don't forget return types
public function getId() { }  // What does it return?
```

## Type Hints and Database Mapping

Our migration system maps PHP types to SQL:

| PHP Type  | SQL Type            | Example                         |
| --------- | ------------------- | ------------------------------- |
| `int`     | `INT`               | `user_id INT`                   |
| `string`  | `VARCHAR(255)`      | `name VARCHAR(255)`             |
| `bool`    | `BOOLEAN`           | `is_active BOOLEAN`             |
| `?string` | `VARCHAR(255) NULL` | `description VARCHAR(255) NULL` |
| `?int`    | `INT NULL`          | `parent_id INT NULL`            |

### Special Cases

```php
// Properties ending in _at → DATETIME
private ?string $created_at;  // → created_at DATETIME

// Properties named 'content', 'description', etc. → TEXT
private ?string $content;  // → content TEXT

// Property named 'id' → AUTO_INCREMENT PRIMARY KEY
private int $id;  // → id INT AUTO_INCREMENT PRIMARY KEY
```

## Checking Types at Runtime

```php
// Check variable type
$value = 123;
is_int($value);     // true
is_string($value);  // false
is_null($value);    // false

// Get type name
gettype($value);    // "integer"

// Check instance
$user = new User();
$user instanceof User;  // true
```

## Type Errors

When you pass wrong type:

```php
function setAge(int $age): void {
    $this->age = $age;
}

setAge("twenty");  // TypeError!
```

**Error message:**

```
TypeError: setAge(): Argument #1 ($age) must be of type int, string given
```

## Summary

1. **Type hints make code safer and clearer**
2. **Use `?type` for nullable values**
3. **Property types** (PHP 7.4+): `private int $id`
4. **Parameter types**: `function foo(string $name)`
5. **Return types**: `function foo(): int`
6. **Union types** (PHP 8.0+): `int|string`
7. **void** means no return value
8. **mixed** means any type

## Further Reading

- [PHP Manual: Type Declarations](https://www.php.net/manual/en/language.types.declarations.php)
- [PHP 7.4: Typed Properties](https://www.php.net/manual/en/migration74.new-features.php)
- [PHP 8.0: Union Types](https://www.php.net/manual/en/language.types.declarations.php#language.types.declarations.union)

---

**Next:** Check out `php-pdo-information-schema.md` to learn about database introspection!
