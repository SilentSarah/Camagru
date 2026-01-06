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
 * File Created: Friday, 21st November 2025 6:03:32 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Core/AbstractModel.php";

class Notification extends AbstractModel
{
    private int $id;
    private int $user_id;
    private string $message;
    private bool $is_read = false;
    private ?string $created_at = null;

    public function __construct() {
        parent::__construct();
        $this->table = "notifications";
    }

    public function getId(): int { return $this->id; }
    public function getUserId(): int { return $this->user_id; }
    public function getMessage(): string { return $this->message; }
    public function isRead(): bool { return $this->is_read; }
    public function getCreatedAt(): ?string { return $this->created_at; }

    public function setId(int $id): void { $this->id = $id; }
    public function setUserId(int $user_id): void { $this->user_id = $user_id; }
    public function setMessage(string $message): void { $this->message = $message; }
    public function setIsRead(bool $is_read): void { $this->is_read = $is_read; }
    public function setCreatedAt(?string $created_at): void { $this->created_at = $created_at; }

    public function save(): void {
        $data = [
            'user_id' => $this->user_id,
            'message' => $this->message,
            'is_read' => $this->is_read,
            'created_at' => $this->created_at,
        ];
        parent::update($this->id, $data);
    }
}
