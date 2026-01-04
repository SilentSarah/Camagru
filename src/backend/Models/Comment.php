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
 * File Created: Friday, 21st November 2025 6:03:20 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Core/AbstractModel.php";

class Comment extends AbstractModel implements JsonSerializable
{
    private int $id;
    private int $photo_id;
    private int $user_id;
    private string $content;
    private ?string $created_at = null;

    public function jsonSerialize(): mixed
    {
        return [
            'id' => $this->id,
            'photo_id' => $this->photo_id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'created_at' => $this->created_at
        ];
    }

    public function __construct()
    {
        parent::__construct();
        $this->table = "comments";
    }

    // Getters
    public function getId(): int
    {
        return $this->id;
    }
    public function getPhotoId(): int
    {
        return $this->photo_id;
    }
    public function getUserId(): int
    {
        return $this->user_id;
    }
    public function getContent(): string
    {
        return $this->content;
    }
    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    // Setters
    public function setId(int $id): void
    {
        $this->id = $id;
    }
    public function setPhotoId(int $photo_id): void
    {
        $this->photo_id = $photo_id;
    }
    public function setUserId(int $user_id): void
    {
        $this->user_id = $user_id;
    }
    public function setContent(string $content): void
    {
        $this->content = $content;
    }
    public function setCreatedAt(?string $created_at): void
    {
        $this->created_at = $created_at;
    }

    public function save(): void
    {
        $data = [
            'photo_id' => $this->photo_id,
            'user_id' => $this->user_id,
            'content' => $this->content,
            'created_at' => $this->created_at,
        ];
        parent::update($this->id, $data);
    }

    public function find($id): ?Comment
    {
        $row = parent::find($id);
        if ($row) {
            $this->id = $row['id'];
            $this->photo_id = $row['photo_id'];
            $this->user_id = $row['user_id'];
            $this->content = $row['content'];
            $this->created_at = $row['created_at'];
            return $this;
        }
        return null;
    }
}
