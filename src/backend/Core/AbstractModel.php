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
 * File Created: Thursday, 20th November 2025 5:53:36 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once "Database.php";

abstract class AbstractModel {
    protected ?PDO $instance;
    protected string $table;
    protected string $primaryKey = "id";
    
    public function __construct() {
        $this->instance = Database::getInstance();
    }

    /**
     * Finds a single element in the database
     * @param mixed $id id of the row to find
     * @return mixed
     */
    public function find($id): mixed {
        $query = "SELECT * FROM $this->table WHERE $this->primaryKey = ?";
        $stmt = $this->instance->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Finds all elements in the database
     * @param mixed $limit limit of rows to return
     * @param int $offset offset of rows to return
     * @return array
     */
    public function findAll(mixed $limit = null, int $offset = 0): array {
        $query = "SELECT * FROM $this->table";
        if ($limit !== null) {
            $query .= " LIMIT $limit OFFSET $offset";
        } else if ($offset > 0) {
            $query .= " OFFSET $offset";
        }
        $stmt = $this->instance->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Finds elements in the database based on criteria
     * @param array $criteria array of conditions which the rows must match
     * @param array $orderBy array of columns to order by
     * @param mixed $limit limit of rows to return
     * @param mixed $offset offset of rows to return
     * @return array
     */
    public function findBy(array $criteria, array $orderBy = [], $limit = null, $offset = null): mixed {
        $bindings = [];
        $whereClause = $this->buildWhereClause($criteria, $bindings);

        $query = "SELECT * FROM $this->table";
        if (!empty($whereClause)) {
            $query .= " WHERE " . $whereClause;
        }

        if (!empty($orderBy)) {
            $query .= " ORDER BY " . implode(", ", array_map(
                fn($key, $value) => "$key {$value}", 
            array_keys($orderBy), array_values($orderBy)));
        }
        if ($limit !== null) {
            $query .= " LIMIT $limit";
        }
        if ($offset !== null) {
            $query .= " OFFSET $offset";
        }

        $stmt = $this->instance->prepare($query);
        $stmt->execute($bindings);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Builds a WHERE clause recursively from a criteria array
     * @param array $criteria
     * @param array $bindings passed by reference to collect values
     * @return string
     */
    private function buildWhereClause(array $criteria, array &$bindings): string {
        if (empty($criteria)) {
            return "";
        }

        $conditions = [];

        foreach ($criteria as $key => $value) {
            // Handle logical operators (AND, OR, NOT)
            if (strtoupper($key) === 'OR' || strtoupper($key) === 'AND') {
                $subConditions = [];
                foreach ($value as $subCriteria) {
                    $subClause = $this->buildWhereClause($subCriteria, $bindings);
                    if (!empty($subClause)) {
                        $subConditions[] = "($subClause)";
                    }
                }
                if (!empty($subConditions)) {
                    $joiner = " " . strtoupper($key) . " ";
                    $conditions[] = "(" . implode($joiner, $subConditions) . ")";
                }
                continue;
            }

            if (strtoupper($key) === 'NOT') {
                $subClause = $this->buildWhereClause($value, $bindings);
                if (!empty($subClause)) {
                    $conditions[] = "NOT ($subClause)";
                }
                continue;
            }

            // Handle field operators
            if (is_array($value)) {
                foreach ($value as $operator => $operand) {
                    switch ($operator) {
                        case 'equals':
                            $conditions[] = "$key = ?";
                            $bindings[] = $operand;
                            break;
                        case 'not':
                            $conditions[] = "$key != ?";
                            $bindings[] = $operand;
                            break;
                        case 'in':
                            $placeholders = implode(',', array_fill(0, count($operand), '?'));
                            $conditions[] = "$key IN ($placeholders)";
                            foreach ($operand as $val) $bindings[] = $val;
                            break;
                        case 'notIn':
                            $placeholders = implode(',', array_fill(0, count($operand), '?'));
                            $conditions[] = "$key NOT IN ($placeholders)";
                            foreach ($operand as $val) $bindings[] = $val;
                            break;
                        case 'lt':
                            $conditions[] = "$key < ?";
                            $bindings[] = $operand;
                            break;
                        case 'lte':
                            $conditions[] = "$key <= ?";
                            $bindings[] = $operand;
                            break;
                        case 'gt':
                            $conditions[] = "$key > ?";
                            $bindings[] = $operand;
                            break;
                        case 'gte':
                            $conditions[] = "$key >= ?";
                            $bindings[] = $operand;
                            break;
                        case 'contains':
                            $conditions[] = "$key LIKE ?";
                            $bindings[] = "%$operand%";
                            break;
                        case 'startsWith':
                            $conditions[] = "$key LIKE ?";
                            $bindings[] = "$operand%";
                            break;
                        case 'endsWith':
                            $conditions[] = "$key LIKE ?";
                            $bindings[] = "%$operand";
                            break;
                        default:
                            // Assume implicit equality if array key is not a recognized operator
                            // This handles cases like 'age' => ['gt' => 18] where 'gt' is the operator
                            // But what if the user passed 'field' => ['unknown' => 'val']?
                            // For safety, we can default to equality or throw error.
                            // Let's assume nested array implies operators.
                            break;
                    }
                }
            } else {
                // Implicit equality: 'key' => 'value'
                $conditions[] = "$key = ?";
                $bindings[] = $value;
            }
        }

        return implode(" AND ", $conditions);
    }

    /**
     * Creates a new element in the database
     * @param array $data array of column data to insert
     * @return mixed
     */
    public function create(array $data): mixed {
        $cols = (string)implode(", ", array_keys($data));
        $rows = (string)implode(", ", array_fill(0, count($data), "?"));
        $query = "INSERT INTO $this->table (" . $cols . ") VALUES (" . $rows . ")";
        $stmt = $this->instance->prepare($query);
        $stmt->execute(array_values($data));
        $row = $this->find($this->instance->lastInsertId());
        return $row;
    }

    /**
     * Updates the instance of the element in the database
     * @param $id The primary id
     * @param array $data array of columns to update
     * @return void
     */
    public function update ($id, array $data): void {
        $keys = array_keys($data);
        $cols = implode(", ", array_map(fn($key) => "$key = ?", $keys));
        $cond = $this->primaryKey . " = ?";
        $query = "UPDATE $this->table SET " . $cols . " WHERE " . $cond;
        $stmt = $this->instance->prepare($query);
        $stmt->execute(array_merge(array_values($data), [$id]));
    }

    /**
     * Deletes a single row from the database
     * @param mixed $id primary key of the row to delete
     * @return bool
     */
    public function delete ($id): bool {
        $query = "DELETE FROM $this->table WHERE " . $this->primaryKey . " = ?";
        $stmt = $this->instance->prepare($query);
        return $stmt->execute([$id]);
    }

    /**
     * Upserts a row into the database
     * @param array $data array of column data to insert/update
     * @return bool
     */
    public function upsert(array $data)
    {
        $keys = array_keys($data);

        $cols = implode(", ", $keys);
        $vals = implode(", ", array_fill(0, count($keys), "?"));

        // conflict clause
        $updates = implode(", ", array_map(fn($k) => "$k = VALUES($k)", $keys));

        $sql = "INSERT INTO {$this->table} ($cols)
                VALUES ($vals)
                ON DUPLICATE KEY UPDATE $updates";
        $stmt = $this->instance->prepare($sql);

        return $stmt->execute(array_values($data));
    }
}
