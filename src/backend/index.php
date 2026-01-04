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


require_once "Core/init.php";
require_once "Controllers/AuthController.php";
require "Controllers/MediaController.php";
require "Controllers/CommentController.php";
require "Controllers/LikeController.php";
require "Controllers/SettingsController.php";
require_once "Core/Middleware.php";

$routes = [
    "/login" => [AuthController::class, "login", ["POST"], false],
    "/register" => [AuthController::class, "register", ["POST", "PUT"], false],
    "/csrf" => [AuthController::class, "csrf", ["GET"], false],
    "/verify-account" => [AuthController::class, "verify_account", ["POST"], false],
    "/request-verification" => [AuthController::class, "request_verification", ["POST"], false],
    "/password-recovery" => [AuthController::class, "request_password_recovery", ["POST"], false],
    "/reset-password" => [AuthController::class, "reset_password", ["POST", "GET"], false],
    "/user" => [AuthController::class, "user", ["GET"], true],
    "/photos" => [MediaController::class, "get_photos", ["GET"], true],
    "/photo" => [MediaController::class, "get_photo", ["GET"], true],
    "/feed" => [MediaController::class, "get_feed", ["GET"], true],
    "/process-image" => [MediaController::class, "process_image", ["POST"], true],
    "/upload-post" => [MediaController::class, "upload_post", ["POST"], true],
    "/uploads" => [MediaController::class, "render_photo", ["GET"], false],
    "/delete-post" => [MediaController::class, "delete_post", ["DELETE"], true],
    "/create-comment" => [CommentController::class, "create", ["POST"], true],
    "/delete-comment" => [CommentController::class, "delete", ["DELETE"], true],
    "/toggle-like" => [LikeController::class, "toggle", ["POST"], true],
    "/update-account" => [SettingsController::class, "update_settings", ["POST"], true],
    "/delete-account" => [SettingsController::class, "delete_account", ["DELETE"], true],
    "/upload-profile-picture" => [MediaController::class, "upload_profile_picture", ["POST"], true],
    "/search-users" => [AuthController::class, "search_users", ["GET"], true],
    "/user-profile" => [AuthController::class, "get_user_profile", ["GET"], true],
];

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'];

if (!array_key_exists($path, $routes)) {
    $response = new HttpResponse(404, "Not Found", ["error" => "Not Found"]);
    $response->sendJson();
    return;
}

[$controller, $action, $methods, $is_protected] = $routes[$path];
Middleware::handle($controller, $action, $methods, $is_protected);
