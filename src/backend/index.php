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
 * File Created: Thursday, 20th November 2025 4:50:17 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once "Controllers/AuthController.php";
require_once "Core/Middleware.php";

use Controllers\AuthController;

$routes = [
    "/login" => [AuthController::class, "login", ["POST"]],
    "/register" => [AuthController::class, "register", ["POST", "PUT"]],
];

$protected_routes = [
    "/testAPI" => [AuthController::class, "testAPI", "GET"],
];

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'];

if (!isset($routes[$path])) {
    http_response_code(404);
    echo json_encode(["error" => "Not Found"]);
    return ;
}

[$controller, $action, $method] = $routes[$path];
Middleware::handle($controller, $action, $method);