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
 * File Created: Monday, 8th December 2025 4:42:33 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Models/Photo.php";
require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Core/Config.php";
require_once __DIR__ . "/../Core/ImageCompositor.php";

class MediaController
{
    public function get_photos()
    {
        if (empty($_GET["user_id"])) {
            $_GET["user_id"] = $_SESSION["user"]["id"];
        }
        $photos = new Photo()->findAll([
            "user_id" => $_GET["user_id"],
        ]);
        $response = new HttpResponse(200, "OK", ["message" => "success", "data" => $photos]);
        $response->sendJson();
    }
}
