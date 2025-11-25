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
    private int $id;
    private int $user_id;
    private string $image_path;
    private ?string $description = null;
    private ?string $created_at = null;

    public function __construct() {
        parent::__construct();
        $this->table = "photos";
    }

    // Getters
    public function getId(): int { return $this->id; }
    public function getUserId(): int { return $this->user_id; }
    public function getImagePath(): string { return $this->image_path; }
    public function getDescription(): ?string { return $this->description; }
    public function getCreatedAt(): ?string { return $this->created_at; }

    // Setters
    public function setId(int $id): void { $this->id = $id; }
    public function setUserId(int $user_id): void { $this->user_id = $user_id; }
    public function setImagePath(string $image_path): void { $this->image_path = $image_path; }
    public function setDescription(?string $description): void { $this->description = $description; }
    public function setCreatedAt(?string $created_at): void { $this->created_at = $created_at; }

    public function save(): void {
        $data = [
            'user_id' => $this->user_id,
            'image_path' => $this->image_path,
            'description' => $this->description,
            'created_at' => $this->created_at,
        ];
        parent::update($this->id, $data);
    }
}
