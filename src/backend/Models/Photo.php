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
 * File Created: Friday, 21st November 2025 6:03:12 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Core/AbstractModel.php";

class Photo extends AbstractModel
{
    private ?int $id = null;
    private ?int $user_id = null;
    private ?string $file_name = null;
    private ?string $description = null;
    private ?DateTime $created_at = null;

    public function __construct() {
        parent::__construct();
        $this->table = "photos";
    }

    public function getId(): int { return $this->id; }
    public function getUserId(): int { return $this->user_id; }
    public function getFileName(): string { return $this->file_name; }
    public function getDescription(): ?string { return $this->description; }
    public function getCreatedAt(): ?DateTime { return $this->created_at; }

    public function setId(int $id): void { $this->id = $id; }
    public function setUserId(int $user_id): void { $this->user_id = $user_id; }
    public function setFileName(string $file_name): void { $this->file_name = $file_name; }
    public function setDescription(?string $description): void { $this->description = $description; }
    public function setCreatedAt(?DateTime $created_at): void { $this->created_at = $created_at; }

    public function save(): void {
        $data = [
            'user_id' => $this->user_id,
            'file_name' => $this->file_name,
            'description' => $this->description,
            'created_at' => $this->created_at,
        ];
        parent::update($this->id, $data);
    }

    public function create(array $data): mixed {
        $data['created_at'] = date("Y-m-d H:i:s", time());
        $row = parent::create($data);
        foreach ($row as $key => $value) {
            match($key) {
                "created_at" => $this->created_at = $value,
                default => $this->$key = $value
            };
        }
        return $this;
    }

    public function find($id): ?Photo {
        $row = parent::find($id);
        if ($row) {
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->file_name = $row['file_name'];
            $this->description = $row['description'];
            $this->created_at = new DateTime($row['created_at']);
        }
        return $this;
    }

    public function remove(): bool {
        parent::delete($this->id);
        return unlink(Config::UPLOAD_DIR . $this->file_name);
    }
}
