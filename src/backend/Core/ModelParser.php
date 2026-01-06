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
 * File Created: Friday, 21st November 2025 6:32:19 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

class ModelParser
{

    /**
     * Parse a model class and extract schema information
     * @param string $modelClass
     * @return array
     */
    public function parseModel(string $modelClass): array
    {
        if (!class_exists($modelClass)) {
            throw new Exception("Model class $modelClass does not exist");
        }

        $reflection = new ReflectionClass($modelClass);
        $properties = $reflection->getProperties(ReflectionProperty::IS_PRIVATE);

        $columns = [];
        foreach ($properties as $property) {
            $name = $property->getName();

            if (in_array($name, ['table', 'primaryKey', 'instance'])) {
                continue;
            }

            $type = $property->getType();
            if ($type === null) {
                continue; // Skip properties without type hints
            }

            $defaultValue = null;
            if ($property->hasDefaultValue()) {
                $defaultValue = $property->getDefaultValue();
            }

            $columns[$name] = $this->phpTypeToSql($name, $type, $defaultValue);
        }

        return [
            'table' => $this->getTableName($modelClass),
            'columns' => $columns
        ];
    }

    /**
     * Get table name from model class
     * @param string $modelClass
     * @return string
     */
    public function getTableName(string $modelClass): string
    {
        try {
            $instance = new $modelClass();
            $reflection = new ReflectionClass($instance);
            $tableProperty = $reflection->getProperty('table');
            $tableProperty->setAccessible(true);
            return $tableProperty->getValue($instance);
        } catch (Exception $e) {
            return strtolower($modelClass) . 's';
        }
    }

    /**
     * Convert PHP type to SQL type
     * @param string $propertyName
     * @param ReflectionType $type
     * @param mixed $defaultValue
     * @return array
     */
    private function phpTypeToSql(string $propertyName, ReflectionType $type, mixed $defaultValue = null): array
    {
        $nullable = $type->allowsNull();
        $typeName = $type instanceof ReflectionNamedType ? $type->getName() : 'mixed';

        $sqlType = 'VARCHAR(255)';
        $extra = '';

        if ($propertyName === 'id') {
            $sqlType = 'INT';
            $extra = 'AUTO_INCREMENT PRIMARY KEY';
            $nullable = false;
        } else if (str_ends_with($propertyName, '_at') || str_ends_with($propertyName, '_time')) {
            $sqlType = 'DATETIME';
        } else {
            switch ($typeName) {
                case 'int':
                    $sqlType = 'INT';
                    break;
                case 'float':
                    $sqlType = 'FLOAT';
                    break;
                case 'bool':
                    $sqlType = 'BOOLEAN';
                    break;
                case 'string':
                    if (in_array($propertyName, ['content', 'description', 'message', 'body', 'text'])) {
                        $sqlType = 'TEXT';
                    } else {
                        $sqlType = 'VARCHAR(255)';
                    }
                    break;
                default:
                    $sqlType = 'VARCHAR(255)';
            }
        }

        return [
            'type' => $sqlType,
            'nullable' => $nullable,
            'extra' => $extra,
            'default' => $defaultValue
        ];
    }

    /**
     * Get all model classes from Models directory
     * @param string $modelsDir
     * @return array
     */
    public function getAllModels(string $modelsDir): array
    {
        $models = [];
        $files = glob($modelsDir . '/*.php');

        foreach ($files as $file) {
            $className = basename($file, '.php');
            require_once $file;
            if (class_exists($className)) {
                $models[] = $className;
            }
        }

        return $models;
    }
}
