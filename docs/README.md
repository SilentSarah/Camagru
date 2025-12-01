# PHP Learning Resources - Index

This directory contains educational materials explaining PHP concepts used in the Camagru project.

## 📚 Available Guides

### Core PHP Concepts

1. **[PHP Reflection API](./php-reflection.md)**

   - What is Reflection and why use it
   - Inspecting classes, properties, and methods at runtime
   - How we use it in `ModelParser` to analyze models
   - Accessing private properties
   - Complete examples from our migration system

2. **[PHP Type Hints and Type System](./php-type-hints.md)**

   - Property, parameter, and return type hints
   - Nullable types (`?string`)
   - Union types (`int|string`)
   - How types map to SQL in our migrations
   - Best practices for type safety

3. **[PHP PDO and INFORMATION_SCHEMA](./php-pdo-information-schema.md)**

   - What is PDO and how to use it
   - What is INFORMATION_SCHEMA
   - Querying database metadata
   - How `SchemaInspector` reads database structure
   - Prepared statements and SQL injection prevention

4. **[PHP String Functions](./php-string-functions.md)**

   - String manipulation functions
   - Regular expressions basics
   - How we create migration names (slugify)
   - Building SQL statements

5. **[Recursive Clause Builder](./php-clause-builder.md)**
   - How to build a Prisma-style query builder
   - Recursive logic explained with diagrams
   - Operator mapping tables
   - Handling logical operators (AND/OR)
   - String interpolation

## 🎯 How to Use These Guides

### For Beginners

Start in this order:

1. **Type Hints** - Understand the type system first
2. **String Functions** - Learn basic string manipulation
3. **PDO and INFORMATION_SCHEMA** - Database interaction
4. **Reflection** - Advanced runtime introspection

### For Specific Features

- **Understanding ModelParser** → Read Reflection + Type Hints
- **Understanding SchemaInspector** → Read PDO and INFORMATION_SCHEMA
- **Understanding MigrationGenerator** → Read all guides

## 📖 Learning Path

Each guide includes:

- ✅ Clear explanations with examples
- ✅ Code from our actual project
- ✅ Step-by-step breakdowns
- ✅ Common patterns and best practices
- ✅ Links to official PHP documentation

## 🔗 External Resources

### Official Documentation

- [PHP Manual](https://www.php.net/manual/en/)
- [PHP The Right Way](https://phptherightway.com/)

### Interactive Learning

- [PHP Exercises](https://www.w3resource.com/php-exercises/)
- [PHP Interactive Tutorial](https://www.learn-php.org/)

## 💡 Tips for Learning

1. **Read the code first** - Look at the actual implementation
2. **Read the guide** - Understand the concepts
3. **Experiment** - Try modifying the code
4. **Build something** - Apply what you learned

## 🚀 Next Steps

After reading these guides, you'll understand:

- How our migration system automatically detects model changes
- How PHP Reflection analyzes class structure
- How we query database metadata
- How to work with types and strings in PHP

## 📝 Contributing

As you learn new PHP concepts in the project, feel free to:

- Add new guides for concepts not covered
- Improve existing guides with examples
- Add exercises or challenges
- Share your learning notes

---

**Happy Learning! 🎓**
