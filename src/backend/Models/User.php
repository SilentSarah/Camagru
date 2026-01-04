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
    private ?string $bio = null;
    private bool $is_verified = false;
    private ?string $verification_token = null;
    private ?string $profile_pic_url = null;
    private ?int $verification_token_gen_date = null;
    private ?string $reset_token = null;
    private ?string $reset_token_expires = null;
    private DateTime $created_at;

    public function __construct()
    {
        parent::__construct();
        $this->table = "users";
        $this->id = null;
        $this->username = null;
        $this->email = null;
        $this->password = null;
        $this->fullname = null;
        $this->bio = null;
        $this->profile_pic_url = null;
        $this->is_verified = false;
        $this->verification_token = null;
        $this->verification_token_gen_date = null;
        $this->reset_token = null;
        $this->reset_token_expires = null;
        $this->created_at = new DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }
    public function getUsername(): ?string
    {
        return $this->username;
    }
    public function getFullname(): ?string
    {
        return $this->fullname;
    }
    public function getEmail(): ?string
    {
        return $this->email;
    }
    public function getPassword(): ?string
    {
        return $this->password;
    }
    public function isVerified(): ?bool
    {
        return $this->is_verified;
    }
    public function getVerificationToken(): ?string
    {
        return $this->verification_token;
    }
    public function getResetToken(): ?string
    {
        return $this->reset_token;
    }
    public function getResetTokenExpires(): ?string
    {
        return $this->reset_token_expires;
    }
    public function getCreatedAt(): DateTime
    {
        return $this->created_at;
    }
    public function getVerificationTokenGenDate(): ?int
    {
        return $this->verification_token_gen_date;
    }
    public function getProfilePicUrl(): ?string
    {
        return $this->profile_pic_url;
    }
    public function getBio(): ?string
    {
        return $this->bio;
    }
    public function setProfilePicUrl(?string $profile_pic_url): void
    {
        $this->profile_pic_url = $profile_pic_url;
    }
    public function setBio(?string $bio): void
    {
        $this->bio = $bio;
    }
    public function setVerificationToken(string $verification_token): void
    {
        $this->verification_token = $verification_token;
    }
    public function setVerificationTokenGenDate(int $verification_token_gen_date): void
    {
        $this->verification_token_gen_date = $verification_token_gen_date;
    }
    public function setResetToken(?string $reset_token): void
    {
        $this->reset_token = $reset_token;
    }
    public function setResetTokenExpires(?string $reset_token_expires): void
    {
        $this->reset_token_expires = $reset_token_expires;
    }
    public function setCreatedAt(DateTime $created_at): void
    {
        $this->created_at = $created_at;
    }
    public function setIsVerified(bool $is_verified): void
    {
        $this->is_verified = $is_verified;
    }
    public function setPassword(string $newpassword): void
    {
        $this->password = $newpassword;
    }
    public function setUsername(string $newusername): void
    {
        $this->username = $newusername;
    }
    public function setFullname(string $newfullname): void
    {
        $this->fullname = $newfullname;
    }
    public function setEmail(string $newemail): void
    {
        $this->email = $newemail;
    }
    public function setId(int $newid): void
    {
        $this->id = $newid;
    }

    public function find($id): ?User
    {
        $row = parent::find($id);
        if ($row) {
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->fullname = $row['fullname'];
            $this->is_verified = $row['is_verified'];
            $this->verification_token = $row['verification_token'];
            $this->verification_token_gen_date = $row['verification_token_gen_date'];
            $this->reset_token = $row['reset_token'];
            $this->profile_pic_url = $row['profile_pic_url'];
            $this->bio = $row['bio'] ?? null;
            $this->reset_token_expires = $row['reset_token_expires'];
            $this->created_at = new DateTime($row['created_at']);
        }
        return $this;
    }

    public function create(array $data): mixed
    {
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }
        $row = parent::create($data);
        foreach ($row as $key => $value) {
            match ($key) {
                "created_at" => $this->created_at = new DateTime(),
                default => $this->$key = $value
            };
        }
        return $this;
    }

    public function save(): void
    {
        $data = [
            'username' => $this->username,
            'email' => $this->email,
            'password' => $this->password,
            'fullname' => $this->fullname,
            'is_verified' => (int)$this->is_verified,
            'verification_token' => $this->verification_token,
            'verification_token_gen_date' => $this->verification_token_gen_date,
            'reset_token' => $this->reset_token,
            'reset_token_expires' => $this->reset_token_expires,
            'profile_pic_url' => $this->profile_pic_url,
            'bio' => $this->bio,
            'created_at' => ($this->created_at instanceof DateTime) ? $this->created_at->format('Y-m-d H:i:s') : $this->created_at,
        ];
        parent::upsert($data);
    }

    /**
     * Finds user by username or email, updates object properties when an existing user is found
     * @param array<string> $personalDetails columns that the find function will search for 
     * @return User
     */
    public function findByPersonalDetails(array $personalDetails): User
    {
        $data = $this->findBy($personalDetails);
        if ($data) {
            $this->id = $data['id'];
            $this->username = $data['username'];
            $this->email = $data['email'];
            $this->password = $data['password'];
            $this->fullname = $data['fullname'];
            $this->is_verified = (bool)$data['is_verified'];
            $this->verification_token = $data['verification_token'];
            $this->profile_pic_url = $data['profile_pic_url'];
            $this->bio = $data['bio'] ?? null;
            $this->reset_token = $data['reset_token'];
            $this->reset_token_expires = $data['reset_token_expires'];
            $this->created_at = new DateTime($data['created_at']);
            $this->verification_token_gen_date = $data['verification_token_gen_date'];
        }
        return $this;
    }
}
