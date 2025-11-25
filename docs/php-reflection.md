# PHP Reflection API - Complete Guide

## What is Reflection?

Reflection is a powerful PHP feature that allows you to **inspect and analyze classes, methods, properties, and functions at runtime**. Think of it as looking in a mirror - you can see the structure of your code while the program is running.

## Why Use Reflection?

Reflection is useful for:

- **Auto-generating code** (like our migration system)
- **Building frameworks** (Laravel, Symfony use it extensively)
- **Creating documentation generators**
- **Dependency injection containers**
- **Testing frameworks**

## Basic Reflection Classes

### 1. ReflectionClass

Inspects a class and its structure.

```php
class User {
    private int $id;
    private string $name;

    public function getName(): string {
        return $this->name;
    }
}

// Create a reflection of the User class
$reflection = new ReflectionClass('User');

// Get class name
echo $reflection->getName(); // "User"

// Check if class is abstract
echo $reflection->isAbstract(); // false

// Get all methods
$methods = $reflection->getMethods();
foreach ($methods as $method) {
    echo $method->getName(); // "getName"
}
```

### 2. ReflectionProperty

Inspects class properties.

```php
$reflection = new ReflectionClass('User');
$properties = $reflection->getProperties();

foreach ($properties as $property) {
    echo $property->getName(); // "id", "name"

    // Check visibility
    if ($property->isPrivate()) {
        echo "Private property!";
    }

    // Get type hint
    $type = $property->getType();
    if ($type) {
        echo $type->getName(); // "int", "string"
    }
}
```

### 3. ReflectionMethod

Inspects class methods.

```php
$reflection = new ReflectionClass('User');
$method = $reflection->getMethod('getName');

echo $method->getName(); // "getName"
echo $method->isPublic(); // true

// Get return type
$returnType = $method->getReturnType();
echo $returnType->getName(); // "string"
```

## How We Use Reflection in ModelParser

### Example from Our Code

```php
class ModelParser {
    public function parseModel(string $modelClass): array {
        // 1. Create reflection of the model class
        $reflection = new ReflectionClass($modelClass);

        // 2. Get all private properties
        $properties = $reflection->getProperties(ReflectionProperty::IS_PRIVATE);

        $columns = [];
        foreach ($properties as $property) {
            // 3. Get property name
            $name = $property->getName();

            // 4. Get type hint
            $type = $property->getType();

            // 5. Check if nullable
            if ($type->allowsNull()) {
                echo "$name can be null";
            }

            // 6. Get type name
            $typeName = $type->getName(); // "int", "string", etc.
        }

        return $columns;
    }
}
```

### Step-by-Step Breakdown

**Step 1: Create Reflection**

```php
$reflection = new ReflectionClass('Photo');
```

This creates a "mirror" of the Photo class that we can inspect.

**Step 2: Get Properties**

```php
$properties = $reflection->getProperties(ReflectionProperty::IS_PRIVATE);
```

Gets all private properties. You can also use:

- `ReflectionProperty::IS_PUBLIC` - public properties
- `ReflectionProperty::IS_PROTECTED` - protected properties
- `ReflectionProperty::IS_STATIC` - static properties

**Step 3: Loop Through Properties**

```php
foreach ($properties as $property) {
    $name = $property->getName(); // "id", "user_id", etc.
}
```

**Step 4: Get Type Information**

```php
$type = $property->getType();
```

Returns a `ReflectionType` object (or null if no type hint).

**Step 5: Check Type Details**

```php
$type->allowsNull();     // true if ?type
$type->getName();        // "int", "string", etc.
```

## ReflectionType Details

### ReflectionNamedType

For simple types like `int`, `string`, `bool`:

```php
private int $age;

$type = $property->getType();
$type->getName();        // "int"
$type->allowsNull();     // false
$type->isBuiltin();      // true (built-in PHP type)
```

### Nullable Types

```php
private ?string $description;

$type = $property->getType();
$type->getName();        // "string"
$type->allowsNull();     // true ← Important!
```

### Union Types (PHP 8.0+)

```php
private int|string $value;

$type = $property->getType();
// $type is ReflectionUnionType
$types = $type->getTypes(); // array of ReflectionNamedType
```

## Accessing Private Properties

Normally you can't access private properties from outside the class:

```php
class User {
    private string $name = "John";
}

$user = new User();
echo $user->name; // ERROR! Cannot access private property
```

But with Reflection, you can:

```php
$reflection = new ReflectionClass($user);
$property = $reflection->getProperty('name');

// Make it accessible
$property->setAccessible(true);

// Now you can get/set it
echo $property->getValue($user); // "John"
$property->setValue($user, "Jane");
```

### How We Use This

In `ModelParser::getTableName()`:

```php
public function getTableName(string $modelClass): string {
    $instance = new $modelClass();
    $reflection = new ReflectionClass($instance);

    // Get the private 'table' property
    $tableProperty = $reflection->getProperty('table');

    // Make it accessible
    $tableProperty->setAccessible(true);

    // Read its value
    return $tableProperty->getValue($instance);
}
```

## Practical Example: Type Mapping

Here's how we convert PHP types to SQL types:

```php
private function phpTypeToSql(string $propertyName, ReflectionType $type): array {
    // Get if nullable
    $nullable = $type->allowsNull();

    // Get type name
    $typeName = $type instanceof ReflectionNamedType
        ? $type->getName()
        : 'mixed';

    // Map to SQL
    $sqlType = match($typeName) {
        'int' => 'INT',
        'float' => 'FLOAT',
        'bool' => 'BOOLEAN',
        'string' => 'VARCHAR(255)',
        default => 'VARCHAR(255)'
    };

    return [
        'type' => $sqlType,
        'nullable' => $nullable
    ];
}
```

### Example Input/Output

```php
// Model property:
private ?string $description;

// Reflection analysis:
$type->getName()      // "string"
$type->allowsNull()   // true

// Output:
[
    'type' => 'VARCHAR(255)',
    'nullable' => true
]

// Becomes SQL:
// description VARCHAR(255) NULL
```

## Common Reflection Methods

### ReflectionClass

- `getName()` - Get class name
- `getProperties()` - Get all properties
- `getMethods()` - Get all methods
- `getProperty($name)` - Get specific property
- `getMethod($name)` - Get specific method
- `isAbstract()` - Check if abstract
- `getParentClass()` - Get parent class reflection

### ReflectionProperty

- `getName()` - Get property name
- `getType()` - Get type hint
- `isPrivate()` - Check if private
- `isPublic()` - Check if public
- `isStatic()` - Check if static
- `setAccessible(true)` - Allow access to private/protected
- `getValue($object)` - Get value from object
- `setValue($object, $value)` - Set value on object

### ReflectionType

- `getName()` - Get type name ("int", "string", etc.)
- `allowsNull()` - Check if nullable
- `isBuiltin()` - Check if built-in type

## Performance Considerations

Reflection is **slower** than normal code because it analyzes structure at runtime.

**Good Use Cases:**

- One-time setup (like generating migrations)
- Framework initialization
- Development tools

**Bad Use Cases:**

- Inside loops processing thousands of items
- Hot paths in production code
- Real-time request handling

### Our Usage

We use reflection in `make_migration.php` which runs **once** when generating a migration. This is perfect because:

- It's not in a hot path
- It runs during development, not production
- Speed doesn't matter for a one-time generation

## Complete Example

Let's analyze a complete model:

```php
class Photo extends AbstractModel {
    private int $id;
    private int $user_id;
    private string $image_path;
    private ?string $description = null;
    private ?string $created_at = null;
}

// Analyze it with reflection
$reflection = new ReflectionClass('Photo');
$properties = $reflection->getProperties(ReflectionProperty::IS_PRIVATE);

foreach ($properties as $property) {
    $name = $property->getName();
    $type = $property->getType();

    if ($type instanceof ReflectionNamedType) {
        $typeName = $type->getName();
        $nullable = $type->allowsNull();

        echo "$name: $typeName" . ($nullable ? ' (nullable)' : '') . "\n";
    }
}

// Output:
// id: int
// user_id: int
// image_path: string
// description: string (nullable)
// created_at: string (nullable)
```

## Key Takeaways

1. **Reflection lets you inspect code structure at runtime**
2. **Use `ReflectionClass` to analyze classes**
3. **Use `ReflectionProperty` to inspect properties**
4. **Use `ReflectionType` to get type information**
5. **`setAccessible(true)` lets you access private members**
6. **Reflection is powerful but slower - use wisely**

## Further Reading

- [PHP Manual: Reflection](https://www.php.net/manual/en/book.reflection.php)
- [ReflectionClass Documentation](https://www.php.net/manual/en/class.reflectionclass.php)
- [ReflectionProperty Documentation](https://www.php.net/manual/en/class.reflectionproperty.php)

---

**Next:** Check out `php-type-hints.md` to learn more about PHP type system!
