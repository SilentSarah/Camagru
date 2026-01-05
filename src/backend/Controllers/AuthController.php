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
 * File Created: Thursday, 20th November 2025 5:14:29 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/../Core/Csrf.php";
require_once __DIR__ . "/../Core/Jwt.php";
require_once __DIR__ . "/../Core/Config.php";
require_once __DIR__ . "/../Core/Utils.php";
require_once __DIR__ . "/../Core/MailVerification.php";

class AuthController
{
    public function login()
    {
        $username = $_POST["username"];
        $password = $_POST["password"];
        if (empty($username) || empty($password)) {
            $response = new HttpResponse(400, "Bad Request", [
                "error" => "Missing required fields",
                "code" => "BAD_REQUEST"
            ]);
            $response->sendJson();
        }
        $username = trim($username);
        try {
            $user = new User();
            $user->findByPersonalDetails(["username" => $username]);
            if ($user->getId() === null) {
                $response = new HttpResponse(404, "User not found", [
                    "error" => "User not found",
                    "code" => "USER_NOT_FOUND"
                ]);
                $response->sendJson();
                return;
            }
            if (!$user->isVerified()) {
                $response = new HttpResponse(401, "User not verified", [
                    "error" => "User not verified",
                    "code" => "USER_NOT_VERIFIED"
                ]);
                $response->sendJson();
                return;
            }
            if (password_verify($password, $user->getPassword())) {
                $jwt = generate_jwt_token("HS256", [
                    "id" => $user->getId(),
                    "username" => $user->getUsername(),
                    "fullname" => $user->getFullname(),
                    "email" => $user->getEmail(),
                    "exp" => time() + 86400 * 7,
                ]);
                setcookie("session_token", $jwt, time() + 86400 * 7, "/", "", false, false);
                $response = new HttpResponse(200, "Login successful", [
                    "message" => "Login successful",
                    "token" => $jwt
                ]);
                $response->sendJson();
            } else {
                $response = new HttpResponse(401, "Unauthorized", [
                    "error" => "Invalid credentials",
                    "code" => "INVALID_CREDENTIALS"
                ]);
                $response->sendJson();
            }
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Server Error", ["error" => $e->getMessage()]);
            $response->sendJson();
        }
    }

    public function register()
    {
        if (empty($_POST["username"]) || empty($_POST["password"]) || empty($_POST["fullname"]) || empty($_POST["email"])) {
            $response = new HttpResponse(400, "Bad Request", [
                "error" => "Missing required fields",
                "code" => "BAD_REQUEST"
            ]);
            $response->sendJson();
            return;
        }
        $_POST["username"] = trim($_POST["username"]);
        $_POST["fullname"] = trim($_POST["fullname"]);
        $_POST["email"] = trim($_POST["email"]);

        $validator = Validator::getInstance();
        $errors = $validator->validate($_POST);

        if (count($errors) > 0) {
            $response = new HttpResponse(400, "Bad Request", [
                "error" => array_values($errors)[0][0],
                "code" => "BAD_REQUEST"
            ]);
            $response->sendJson();
            return;
        }

        try {
            $user = new User();
            $password_hashed = password_hash($_POST["password"], PASSWORD_BCRYPT);
            $user->create([
                "username" => $_POST["username"],
                "password" => $password_hashed,
                "fullname" => $_POST["fullname"],
                "email" => $_POST["email"],
                "is_verified" => 0,
            ]);

            $jwt = generate_jwt_token("HS256", [
                "id" => $user->getId(),
                "username" => $user->getUsername(),
                "fullname" => $user->getFullname(),
                "email" => $user->getEmail(),
                "exp" => time() + 86400 * 7,
            ]);
            setcookie("session_token", $jwt, time() + 86400 * 7, "/", "", false, false);
            sendVerifcationMail($user);
            $response = new HttpResponse(201, "User created successfully", ["message" => "User created successfully"]);
        } catch (PDOException $e) {
            match ($e->getCode()) {
                "23000" => $response = new HttpResponse(409, "User already exists", ["error" => "User already exists", "code" => "USER_ALREADY_EXISTS"]),
                default => $response = new HttpResponse(500, "Internal Server Error", ["error" => "Internal Server Error", "code" => "INTERNAL_SERVER_ERROR"])
            };
        } finally {
            $response->sendJson();
        }
    }

    public function verify_account()
    {
        $token = $_GET["token"];

        if (empty($token)) {
            $response = new HttpResponse(400, "Bad Request", ["error" => "Missing token", "code" => "BAD_REQUEST"]);
            $response->sendJson();
            return;
        }

        $user = new User();
        $user->findByPersonalDetails(["verification_token" => $token]);

        if ($user->getId() === null) {
            $response = new HttpResponse(404, "User not found", ["error" => "User not found", "code" => "USER_NOT_FOUND"]);
            $response->sendJson();
            return;
        }

        if ($user->isVerified()) {
            $response = new HttpResponse(409, "User already verified", [
                "user_id" => $user->getId(),
                "message" => "User already verified",
                "code" => "USER_ALREADY_VERIFIED"
            ]);
            $response->sendJson();
            return;
        }

        if ($user->getVerificationToken() !== $token) {
            $response = new HttpResponse(401, "Invalid verification token", [
                "user_id" => $user->getId(),
                "error" => "Invalid verification token",
                "code" => "INVALID_VERIFICATION_TOKEN"
            ]);
            $response->sendJson();
            return;
        }

        if ($user->getVerificationTokenGenDate() < time() - Config::VERIFICATION_EXPIRY_TIME) {
            $response = new HttpResponse(401, "Unauthorized", [
                "user_id" => $user->getId(),
                "error" => "Verification token expired",
                "code" => "VERIFICATION_TOKEN_EXPIRED"
            ]);
            $response->sendJson();
            return;
        }

        $user->setIsVerified(true);
        $user->save();

        $response = new HttpResponse(200, "User verified successfully", [
            "user_id" => $user->getId(),
            "message" => "User verified successfully"
        ]);
        $response->sendJson();
    }

    public function request_verification()
    {
        $user = new User();
        $email = trim($_POST["email"]);
        $user->findByPersonalDetails(["email" => $email]);

        if ($user->getId() === null) {
            $response = new HttpResponse(404, "User not found", ["error" => "User not found", "code" => "USER_NOT_FOUND"]);
            $response->sendJson();
            return;
        }

        if ($user->isVerified()) {
            $response = new HttpResponse(409, "User already verified", [
                "user_id" => $user->getId(),
                "error" => "User already verified",
                "code" => "USER_ALREADY_VERIFIED"
            ]);
            $response->sendJson();
            return;
        }

        if ($user->getVerificationTokenGenDate() > time() - Config::VERIFICATION_EXPIRY_TIME) {
            $response = new HttpResponse(401, "Unauthorized", [
                "user_id" => $user->getId(),
                "error" => "Verification request is too recent, please try again later",
                "code" => "VERIFICATION_REQUEST_TOO_RECENT"
            ]);
            $response->sendJson();
            return;
        }

        sendVerifcationMail($user);
        $response = new HttpResponse(200, "Verification email sent", [
            "user_id" => $user->getId(),
            "error" => "Verification email sent"
        ]);
        $response->sendJson();
    }

    public function csrf()
    {
        $token = generate_csrf_token();
        $response = new HttpResponse(200, "CSRF token", ["csrf_token" => $token]);
        $response->sendJson();
    }

    public function user()
    {
        $id = $_SESSION["user"];
        try {
            $user = new User()->find($id);
            if ($user->getId() === null) {
                $response = new HttpResponse(404, "User not found", ["error" => "User not found", "code" => "USER_NOT_FOUND"]);
                $response->sendJson();
                return;
            }
            $data = [
                "id" => $user->getId(),
                "fullname" => $user->getFullname(),
                "username" => $user->getUsername(),
                "email" => $user->getEmail(),
                "bio" => $user->getBio(),
                "is_verified" => $user->isVerified(),
                "email_notifications" => $user->getEmailNotifications(),
                "profile_pic_url" => $user->getProfilePicUrl() ?? null,
                "created_at" => $user->getCreatedAt()
            ];
            $response = new HttpResponse(200, "Success", ["user" => $data]);
            $response->sendJson();
        } catch (PDOException $e) {
            $response = new HttpResponse(401, "Unauthorized", ["error" => "Unauthorized", "code" => "UNAUTHORIZED"]);
            $response->sendJson();
            return;
        }
    }

    public function search_users()
    {
        $query = isset($_GET['q']) ? trim($_GET['q']) : '';

        if (strlen($query) < 2) {
            $response = new HttpResponse(200, "OK", ["users" => []]);
            $response->sendJson();
            return;
        }

        // Sanitize query
        $query = htmlspecialchars($query, ENT_QUOTES, 'UTF-8');

        try {
            $db = Database::getInstance();
            $stmt = $db->prepare("SELECT id, username, fullname, profile_pic_url FROM users WHERE username LIKE :query OR fullname LIKE :query LIMIT 20");
            $searchTerm = '%' . $query . '%';
            $stmt->execute(['query' => $searchTerm]);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $response = new HttpResponse(200, "OK", ["users" => $users]);
            $response->sendJson();
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Error", ["error" => "Search failed"]);
            $response->sendJson();
        }
    }

    public function get_user_profile()
    {
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

        if (!$userId) {
            $response = new HttpResponse(400, "Bad Request", ["error" => "User ID required"]);
            $response->sendJson();
            return;
        }

        try {
            $user = new User()->find($userId);

            if (!$user->getId()) {
                $response = new HttpResponse(404, "Not Found", ["error" => "User not found"]);
                $response->sendJson();
                return;
            }

            $data = [
                "id" => $user->getId(),
                "fullname" => $user->getFullname(),
                "username" => $user->getUsername(),
                "bio" => $user->getBio(),
                "profile_pic_url" => $user->getProfilePicUrl() ?? null,
            ];

            $response = new HttpResponse(200, "OK", ["user" => $data]);
            $response->sendJson();
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Error", ["error" => "Failed to get user"]);
            $response->sendJson();
        }
    }

    public function request_password_recovery()
    {
        $email = $_POST["email"];
        if (empty($email)) {
            $response = new HttpResponse(400, "Bad Request", ["error" => "Missing email", "code" => "BAD_REQUEST"]);
            $response->sendJson();
            return;
        }

        $user = new User();
        $user->findByPersonalDetails(["email" => $email]);

        if ($user->getId() === null) {
            $response = new HttpResponse(404, "User not found", ["error" => "User not found", "code" => "USER_NOT_FOUND"]);
            $response->sendJson();
            return;
        }

        if ($user->getResetTokenExpires() > time() - Config::VERIFICATION_EXPIRY_TIME) {
            $response = new HttpResponse(401, "Unauthorized", [
                "user_id" => $user->getId(),
                "error" => "Password recovery request is too recent, please try again later",
                "code" => "PASSWORD_RECOVERY_REQUEST_TOO_RECENT"
            ]);
            $response->sendJson();
            return;
        }

        sendPasswordRecoveryEmail($user);
        $response = new HttpResponse(200, "Password recovery email sent", [
            "user_id" => $user->getId(),
            "message" => "Password recovery email sent"
        ]);
        $response->sendJson();
    }

    public function reset_password()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $token = $_GET["token"];

        if (empty($token)) {
            $response = new HttpResponse(400, "Bad Request", ["error" => "Missing token", "code" => "BAD_REQUEST"]);
            $response->sendJson();
            return;
        }

        if ($method === "GET") {
            $user = new User()->findByPersonalDetails(["reset_token" => $token]);
            if ($user->getId() === null) {
                $response = new HttpResponse(404, "User not found", ["error" => "User not found", "code" => "USER_NOT_FOUND"]);
                $response->sendJson();
                return;
            }
            if ($user->getResetTokenExpires() < time() - Config::VERIFICATION_EXPIRY_TIME) {
                $response = new HttpResponse(401, "Unauthorized", [
                    "user_id" => $user->getId(),
                    "error" => "Password recovery request expired",
                    "code" => "PASSWORD_RECOVERY_REQUEST_EXPIRED"
                ]);
                $response->sendJson();
                return;
            }
            $response = new HttpResponse(200, "success", ["user_id" => $user->getId()]);
            $response->sendJson();
        } else if ($method === "POST") {
            $user = new User()->findByPersonalDetails(["reset_token" => $token]);
            if ($user->getId() === null) {
                $response = new HttpResponse(404, "User not found", ["error" => "User not found", "code" => "USER_NOT_FOUND"]);
                $response->sendJson();
                return;
            }
            if ($user->getResetTokenExpires() < time() - Config::VERIFICATION_EXPIRY_TIME) {
                $response = new HttpResponse(401, "Unauthorized", [
                    "user_id" => $user->getId(),
                    "error" => "Password recovery request expired",
                    "code" => "PASSWORD_RECOVERY_REQUEST_EXPIRED"
                ]);
                $response->sendJson();
                return;
            }
            $password = $_POST["password"];
            $confirmation_password = $_POST["confirm_password"];
            if (empty($password)) {
                $response = new HttpResponse(400, "Bad Request", ["error" => "Missing password", "code" => "BAD_REQUEST"]);
                $response->sendJson();
                return;
            }

            if ($password !== $confirmation_password) {
                $response = new HttpResponse(400, "Bad Request", ["error" => "Passwords do not match", "code" => "BAD_REQUEST"]);
                $response->sendJson();
                return;
            }

            $validator = Validator::getInstance();
            $errors = $validator->validateField("password", $_POST);

            if (count($errors) > 0) {
                $response = new HttpResponse(400, "Bad Request", ["code" => "BAD_REQUEST", "error" => $errors[0]]);
                $response->sendJson();
                return;
            }

            $hashed_password = password_hash($password, PASSWORD_BCRYPT);
            $user->setPassword($hashed_password);
            $user->setResetTokenExpires(null);
            $user->setResetToken(null);
            $user->save();
            $response = new HttpResponse(200, "Password reset successfully", ["user_id" => $user->getId()]);
            $response->sendJson();
        }
    }
}
