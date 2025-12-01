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
class Middleware {
    /**
     * Handle method that processes requests, allowed methods, available endpoints and lastly whether the user is authenticated or not
     * It's pretty experimental and not production ready
     * @param mixed $controller Controller name that will be instantiated
     * @param mixed $action endpoint (class method) related to the controller
     * @param array $method Allowed HTTP method (GET, POST, PUT, DELETE)
     * @return void
     */
    public static function handle ($controller, $action, $methods) {
        if (!method_exists($controller, $action)) {
            $response = new HttpResponse(404, "Not Found", ["error"=> "Not Found"]);
            $response->sendJson();
            return;
        }

        $requested_method = $_SERVER["REQUEST_METHOD"];
        
        cors();
        if ($requested_method === "OPTIONS") {
            return;
        }

        if (!in_array($requested_method, $methods)) {
            $response = new HttpResponse(405, "Method not allowed", ["error"=> "Method not allowed"]);
            $response->sendJson();
            return;
        }

        if (in_array($requested_method, ["POST", "PUT", "DELETE"]) &&
            !verify_csrf_token($_SERVER["HTTP_X_CSRF_TOKEN"])) {
            $response = new HttpResponse(401, "CSRF token is invalid", ["error"=> "CSRF token is invalid"]);
            $response->sendJson();
            return;
        }

        $controller = new $controller();
        $controller->$action();
    }
}