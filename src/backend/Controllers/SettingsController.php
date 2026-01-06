<?php

require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/../Core/Validator.php";

class SettingsController
{

    public function update_settings()
    {
        $userId = $_SESSION["user"];
        $user = new User();
        $user->find($userId);

        if ($user->getId() === null) {
            $response = new HttpResponse(404, "User not found", ["error" => "User not found"]);
            $response->sendJson();
            return;
        }

        $edited_data = [];
        $errors = [];

        $data = $_POST;

        $validator = Validator::getInstance();

        if (!empty($data['username']) && $data['username'] !== $user->getUsername()) {
            $existing = new User();
            $existing->findByPersonalDetails(['username' => $data['username']]);
            if ($existing->getId() !== null) {
                $response = new HttpResponse(400, "Username taken", ["error" => "Username is already taken"]);
                $response->sendJson();
                return;
            }
            $errors = $validator->validateField('username', $data);
            $data['username'] = htmlspecialchars($data['username'], ENT_QUOTES, 'UTF-8');
            $user->setUsername($data['username']);
            $edited_data['username'] = $data['username'];
        }

        if (!empty($data['email']) && $data['email'] !== $user->getEmail()) {
            $existing = new User();
            $existing->findByPersonalDetails(['email' => $data['email']]);
            if ($existing->getId() !== null) {
                $response = new HttpResponse(400, "Email taken", ["error" => "Email is already taken"]);
                $response->sendJson();
                return;
            }
            $errors = $validator->validateField('email', $data);
            $data['email'] = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
            $user->setEmail($data['email']);
            $edited_data['email'] = $data['email'];
        }

        if (!empty($data['fullname']) && $data['fullname'] !== $user->getFullname()) {
            $errors = $validator->validateField('fullname', $data);
            $data['fullname'] = htmlspecialchars($data['fullname'], ENT_QUOTES, 'UTF-8');
            $user->setFullname($data['fullname']);
            $edited_data['fullname'] = $data['fullname'];
        }

        if (isset($data['bio']) && $data['bio'] !== $user->getBio()) {
            if (strlen($data['bio']) > 150) {
                $response = new HttpResponse(400, "Bio too long", ["error" => "Bio must be 150 characters or less"]);
                $response->sendJson();
                return;
            }
            $data['bio'] = htmlspecialchars($data['bio'], ENT_QUOTES, 'UTF-8');
            $user->setBio($data['bio']);
            $edited_data['bio'] = $data['bio'];
        }

        if (!empty($data['password'])) {
            $errors = $validator->validateField('password', $data);
            $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        }

        if (isset($data['email_notifications'])) {
            $emailNotifications = filter_var($data['email_notifications'], FILTER_VALIDATE_BOOLEAN);
            $user->setEmailNotifications($emailNotifications);
            $edited_data['email_notifications'] = $emailNotifications;
        }

        if (!empty($errors)) {
            $response = new HttpResponse(400, "Validation failed", ["error" => $errors[0]]);
            $response->sendJson();
            return;
        }

        try {
            $user->save();
            $response = new HttpResponse(200, "Settings updated", ["message" => "Settings updated successfully", "user" => $edited_data]);
            $response->sendJson();
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Error", ["error" => $e->getMessage()]);
            $response->sendJson();
        }
    }

    public function delete_account()
    {
        if (!isset($_SESSION["user"])) {
            $response = new HttpResponse(401, "Unauthorized", ["error" => "User not logged in"]);
            $response->sendJson();
            return;
        }

        $userId = $_SESSION["user"];
        $user = new User();

        try {
            if ($user->delete($userId)) {
                $_SESSION = array();
                if (ini_get("session.use_cookies")) {
                    $params = session_get_cookie_params();
                    setcookie(
                        session_name(),
                        '',
                        time() - 42000,
                        $params["path"],
                        $params["domain"],
                        $params["secure"],
                        $params["httponly"]
                    );
                }
                session_destroy();

                $response = new HttpResponse(200, "Account deleted", ["message" => "Account deleted successfully"]);
                $response->sendJson();
            } else {
                $response = new HttpResponse(500, "Deletion failed", ["error" => "Could not delete account"]);
                $response->sendJson();
            }
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Error", ["error" => $e->getMessage()]);
            $response->sendJson();
        }
    }
}
