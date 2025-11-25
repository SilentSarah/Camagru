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


use HttpResponse;
use User;

class AuthController
{
    public function login()
    {
        $username = $_POST["username"];
        $password = $_POST["password"];


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

        $user = new User();
        $user->findByPersonalDetails($username, $email);
        if ($user->getId() != null) {
            $response = new HttpResponse(409, "User already exists", ["message"=> "User already exists"]);
            $response->sendJson();
        } else {
            $user->create([
                "username" => $username,
                "password" => $password,
                "fullname" => $fullname,
                "email" => $email
            ]);
            $response = new HttpResponse(201, "Register successful", ["message" => "User created successfully"]);
            $response->sendJson();
        }
    }
}