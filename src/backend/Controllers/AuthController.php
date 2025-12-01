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

namespace Controllers;
require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/../Core/Csrf.php";
require_once __DIR__ . "/../Core/Jwt.php";

use HttpResponse;
use PDOException;
use User;
use Validator;

class AuthController
{
    public function login()
    {
        $username = $_POST["username"];
        $password = $_POST["password"];

        if (empty($username) || empty($password)) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Missing required fields"]);
            $response->sendJson();  
        }

        try {
            $user = new User();
            $user->findByPersonalDetails($username);
            if (password_verify($password, $user->getPassword())) {
                $jwt = generate_jwt_token("HS256", [
                    "id" => $user->getId(),
                    "username" => $user->getUsername(),
                    "fullname" => $user->getFullname(),
                    "email" => $user->getEmail(),
                    "exp" => time() + 86400 * 7,
                ]);
                setcookie("session_token", $jwt, time() + 86400 * 7, "/", "", false, false);
                $response = new HttpResponse(200, "Login successful", ["message" => "User created successfully", "token" => $jwt]);
                $response->sendJson();
            } else {
                $response = new HttpResponse(401, "Unauthorized", ["message" => "Invalid credentials"]);
                $response->sendJson();
            }
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Server Error", ["error" => $e->getMessage()]);
            $response->sendJson();
        }
    }

    public function register()
    {
        $username = $_POST["username"];
        $password = $_POST["password"];
        $fullname = $_POST["fullname"];
        $email = $_POST["email"];

        if (empty($username) || empty($password) || empty($fullname) || empty($email)) {
            $response = new HttpResponse(400, "Bad Request", ["error" => ["Missing required fields"]]);
            $response->sendJson();
            return ;
        }
        
        $validator = Validator::getInstance();
        $errors = $validator->validate($_POST);
        
        if (count($errors) > 0) {
            $response = new HttpResponse(400, "Bad Request", ["error" => array_values($errors)[0][0]]);
            $response->sendJson();
            return ;
        }

        try {
            $user = new User();
            $password_hashed = password_hash($password, PASSWORD_BCRYPT);
            $user = $user->create([
                "username" => $username,
                "password" => $password_hashed,
                "fullname" => $fullname,
                "email" => $email
            ]);
            $jwt = generate_jwt_token("HS256", [
                "id" => $user->getId(),
                "username" => $user->getUsername(),
                "fullname" => $user->getFullname(),
                "email" => $user->getEmail(),
                "exp" => time() + 86400 * 7,
            ]);
            setcookie("session_token", $jwt, time() + 86400 * 7, "/", "", false, false);
            $response = new HttpResponse(201, "Register successful", ["message" => "User created successfully"]);
        } catch (PDOException $e) {
            match($e->getCode()) {
                "23000" => $response = new HttpResponse(409, "User already exists", ["error"=> "User already exists"]),
                default => $response = new HttpResponse(400, "Bad Request", ["error" => "Bad Request"])
            };
        } finally {
            $response->sendJson();
        }
    }

    public function csrf()
    {
        $token = generate_csrf_token();
        $response = new HttpResponse(200, "CSRF token", ["csrf_token" => $token]);
        $response->sendJson();
    }
}