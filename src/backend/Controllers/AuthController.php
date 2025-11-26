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

use HttpResponse;
use PDOException;
use User;

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
                $response = new HttpResponse(200, "Login successful", ["message" => "User created successfully"]);
                $response->sendJson();
            } else {
                $response = new HttpResponse(401, "Unauthorized", ["message" => "Invalid credentials"]);
                $response->sendJson();
            }
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Server Error", ["error" => $e->getMessage()]);
            $response->sendJson();
        }

        setcookie("pookie", "bears", time() + 3600, "/", "localhost", false, true);
        $response = new HttpResponse(200, "Login successful", ["username" => $username, "password" => $password]);
        $response->sendJson();
    }

    public function register()
    {
        $username = $_POST["username"];
        $password = $_POST["password"];
        $fullname = $_POST["fullname"];
        $email = $_POST["email"];

        if (empty($username) || empty($password) || empty($fullname) || empty($email)) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Missing required fields"]);
            $response->sendJson();
        }

        try {
            $user = new User();
            $user->findByPersonalDetails($username, $email);
            if ($user->getId() != null) {
                $response = new HttpResponse(409, "User already exists", ["message"=> "User already exists"]);
                $response->sendJson();
            } else {
                $password_hashed = password_hash($password, PASSWORD_BCRYPT);
                $user->create([
                    "username" => $username,
                    "password" => $password_hashed,
                    "fullname" => $fullname,
                    "email" => $email
                ]);
                $response = new HttpResponse(201, "Register successful", ["message" => "User created successfully"]);
                $response->sendJson();
            }
        } catch (PDOException $e) {
            $response = new HttpResponse(500, "Internal Server Error", ["error" => $e->getMessage()]);
            $response->sendJson();
        }

    }
}