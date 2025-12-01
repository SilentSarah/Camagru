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
 * File Created: Thursday, 20th November 2025 5:53:06 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Core/AbstractModel.php";
class User extends AbstractModel
{
    private ?int $id = null;
    private ?string $username = null;
    private ?string $email = null;
    private ?string $password = null;
    private ?string $fullname = null;
    private ?bool $is_verified = false;
    private ?string $verification_token = null;
    private ?string $reset_token = null;
    private ?string $reset_token_expires = null;
    private ?string $created_at = null;
    
    public function __construct() {
        parent::__construct();
        $this->table = "users";
    }

    public function getId(): ?int { return $this->id; }
    public function getUsername(): ?string { return $this->username; }
    public function getFullname(): ?string { return $this->fullname; }
    public function getEmail(): ?string { return $this->email; }
    public function getPassword(): ?string { return $this->password; }
    public function isVerified(): ?bool { return $this->is_verified; }
    public function getVerificationToken(): ?string { return $this->verification_token; }
    public function getResetToken(): ?string { return $this->reset_token; }
    public function getResetTokenExpires(): ?string { return $this->reset_token_expires; }
    public function getCreatedAt(): ?string { return $this->created_at; }
    public function setVerificationToken(?string $verification_token): void { $this->verification_token = $verification_token; }
    public function setResetToken(?string $reset_token): void { $this->reset_token = $reset_token; }
    public function setResetTokenExpires(?string $reset_token_expires): void { $this->reset_token_expires = $reset_token_expires; }
    public function setCreatedAt(?string $created_at): void { $this->created_at = $created_at; }    
    public function setIsVerified(bool $is_verified): void { $this->is_verified = $is_verified; }
    public function setPassword(string $newpassword): void { $this->password = $newpassword; }
    public function setUsername(string $newusername): void { $this->username = $newusername; }
    public function setFullname(string $newfullname): void { $this->fullname = $newfullname; }
    public function setEmail(string $newemail): void { $this->email = $newemail; }
    public function setId(int $newid): void { $this->id = $newid; }

    public function create(array $data): mixed { 
        $row = parent::create($data);
        foreach ($row as $key => $value) {
            $this->$key = $value;
        }
        return $this;
    }

    public function save(): void {
        $data = [
            'username' => $this->username,
            'email' => $this->email,
            'password' => $this->password,
            'fullname' => $this->fullname,
            'is_verified' => $this->is_verified,
            'verification_token' => $this->verification_token,
            'reset_token' => $this->reset_token,
            'reset_token_expires' => $this->reset_token_expires,
            'created_at' => $this->created_at,
        ];
        parent::upsert($data);
    }

    /**
     * Finds user by username or email, updates object properties when an existing user is found
     * @param array<string> $personalDetails columns that the find function will search for 
     * @return void
     */
    public function findByPersonalDetails(array $personalDetails): void {
        $data = $this->findBy($personalDetails);
        if ($data) {
            $this->id = $data['id'];
            $this->username = $data['username'];
            $this->email = $data['email'];
            $this->password = $data['password'];
            $this->fullname = $data['fullname'];
            $this->is_verified = $data['is_verified'];
            $this->verification_token = $data['verification_token'];
            $this->reset_token = $data['reset_token'];
            $this->reset_token_expires = $data['reset_token_expires'];
            $this->created_at = $data['created_at'];
        }
    }
    
}