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
 * File Created: Monday, 24th November 2025 2:30:19 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once "Controllers/AuthController.php";
require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Core/Cors.php";
require_once __DIR__ . "/Csrf.php";

/**
 * Custom built Middleware class by Sarah Hicham Meftah, Contains one static method handle <br />
 * can be called by including this file and calling Middleware::handle($controller, $action, $method)
 */
class Middleware
{
    /**
     * Handle method that processes requests, allowed methods, available endpoints and lastly whether the user is authenticated or not
     * It's pretty experimental and not production ready
     * @param mixed $controller Controller name that will be instantiated
     * @param mixed $action endpoint (class method) related to the controller
     * @param array $method Allowed HTTP method (GET, POST, PUT, DELETE)
     * @param bool $is_protected Whether the endpoint is protected or not
     * @return void
     */
    public static function handle($controller, $action, $methods, $is_protected)
    {
        $requested_method = $_SERVER["REQUEST_METHOD"];

        cors();
        if ($requested_method === "OPTIONS") {
            return;
        }

        if (!in_array($requested_method, $methods)) {
            $response = new HttpResponse(405, "Method not allowed", ["error" => "Method not allowed"]);
            $response->sendJson();
            return;
        }

        if (
            !in_array($requested_method, ["GET", "HEAD"]) &&
            !verify_csrf_token($_SERVER["HTTP_X_CSRF_TOKEN"])
        ) {
            $response = new HttpResponse(401, "CSRF token is invalid", ["error" => "CSRF token is invalid"]);
            $response->sendJson();
            return;
        }

        if ($is_protected === true) {
            if (empty($_SERVER["HTTP_AUTHORIZATION"])) {
                $response = new HttpResponse(401, "Unauthorized", ["error" => "Unauthorized"]);
                $response->sendJson();
                return;
            }

            $authorization = $_SERVER["HTTP_AUTHORIZATION"];
            $jwt = str_replace("Bearer ", "", $authorization);
            if (!verify_jwt_token($jwt)) {
                $response = new HttpResponse(401, "Unauthorized", ["error" => "Unauthorized"]);
                $response->sendJson();
                return;
            }

            $claims = get_jwt_claims($jwt);
            $user = new User()->find($claims["id"]); 
            if (!$user) {
                $response = new HttpResponse(401, "Unauthorized", ["error" => "Unauthorized"]);
                $response->sendJson();
                return;
            }
            $_SESSION["user"] = $user->getId();
        }

        $controller = new $controller();
        $controller->$action();
    }
}
