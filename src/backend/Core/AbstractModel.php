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
    protected static ?PDO $instance;
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
        $cond =  implode(" OR ", array_map(
                    fn($key) => "$key = ?", 
                array_keys($criteria)));

        $query = "SELECT * FROM $this->table WHERE " . $cond;

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
        $stmt->execute(array_values($criteria));
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        return $this->find($this->instance->lastInsertId());
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
