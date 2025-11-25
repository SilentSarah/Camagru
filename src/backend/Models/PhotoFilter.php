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
 * File Created: Friday, 21st November 2025 6:03:30 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Core/AbstractModel.php";
class PhotoFilter extends AbstractModel
{
    private int $id;
    private int $photo_id;
    private int $filter_id;
    private int $position_x = 0;
    private int $position_y = 0;
    private ?int $width = null;
    private ?int $height = null;

    public function __construct() {
        parent::__construct();
        $this->table = "photo_filters";
    }

    // Getters
    public function getId(): int { return $this->id; }
    public function getPhotoId(): int { return $this->photo_id; }
    public function getFilterId(): int { return $this->filter_id; }
    public function getPositionX(): int { return $this->position_x; }
    public function getPositionY(): int { return $this->position_y; }
    public function getWidth(): ?int { return $this->width; }
    public function getHeight(): ?int { return $this->height; }

    // Setters
    public function setId(int $id): void { $this->id = $id; }
    public function setPhotoId(int $photo_id): void { $this->photo_id = $photo_id; }
    public function setFilterId(int $filter_id): void { $this->filter_id = $filter_id; }
    public function setPositionX(int $position_x): void { $this->position_x = $position_x; }
    public function setPositionY(int $position_y): void { $this->position_y = $position_y; }
    public function setWidth(?int $width): void { $this->width = $width; }
    public function setHeight(?int $height): void { $this->height = $height; }

    public function save(): void {
        $data = [
            'photo_id' => $this->photo_id,
            'filter_id' => $this->filter_id,
            'position_x' => $this->position_x,
            'position_y' => $this->position_y,
            'width' => $this->width,
            'height' => $this->height,
        ];
        parent::update($this->id, $data);
    }
}
