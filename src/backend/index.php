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
require_once "Controllers/MediaController.php";
require_once "Controllers/CommentController.php";
require_once "Controllers/LikeController.php";
require_once "Controllers/SettingsController.php";
require_once "Core/Middleware.php";

$routes = [
    "/api/login" => [AuthController::class, "login", ["POST"], false],
    "/api/register" => [AuthController::class, "register", ["POST", "PUT"], false],
    "/api/csrf" => [AuthController::class, "csrf", ["GET"], false],
    "/api/verify-account" => [AuthController::class, "verify_account", ["POST"], false],
    "/api/request-verification" => [AuthController::class, "request_verification", ["POST"], false],
    "/api/password-recovery" => [AuthController::class, "request_password_recovery", ["POST"], false],
    "/api/reset-password" => [AuthController::class, "reset_password", ["POST", "GET"], false],
    "/api/user" => [AuthController::class, "user", ["GET"], true],
    "/api/photos" => [MediaController::class, "get_photos", ["GET"], true],
    "/api/photo" => [MediaController::class, "get_photo", ["GET"], true],
    "/api/feed" => [MediaController::class, "get_feed", ["GET"], true],
    "/api/process-image" => [MediaController::class, "process_image", ["POST"], true],
    "/api/upload-post" => [MediaController::class, "upload_post", ["POST"], true],
    "/api/uploads" => [MediaController::class, "render_photo", ["GET"], false],
    "/api/delete-post" => [MediaController::class, "delete_post", ["DELETE"], true],
    "/api/create-comment" => [CommentController::class, "create", ["POST"], true],
    "/api/delete-comment" => [CommentController::class, "delete", ["DELETE"], true],
    "/api/toggle-like" => [LikeController::class, "toggle", ["POST"], true],
    "/api/update-account" => [SettingsController::class, "update_settings", ["POST"], true],
    "/api/delete-account" => [SettingsController::class, "delete_account", ["DELETE"], true],
    "/api/upload-profile-picture" => [MediaController::class, "upload_profile_picture", ["POST"], true],
    "/api/search-users" => [AuthController::class, "search_users", ["GET"], true],
    "/api/user-profile" => [AuthController::class, "get_user_profile", ["GET"], true],
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
