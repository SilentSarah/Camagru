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
require_once __DIR__ . "/../Core/Utils.php";

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

    public function process_image()
    {
        $image = $_POST["image"];
        $filter = $_POST["filter"];
        $stickers = json_decode($_POST["stickers"], true);
        $info = ImageHelpers::get_base64_info($image);
        if ($info == null) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Invalid image"]);
            $response->sendJson();
            return;
        }

        if (!in_array($info["type"], Config::SUPPORTED_IMAGE_MIME_TYPES)) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Invalid image type"]);
            $response->sendJson();
            return;
        }

        if ($info["size"] > Config::MAX_FILE_SIZE) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Max file size is 10MB"]);
            $response->sendJson();
            return;
        }
        $stickers = ImageHelpers::check_stickers($stickers);
        if ($stickers == false) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Invalid stickers"]);
            $response->sendJson();
            return;
        }

        try {
            $image = ImageHelpers::allocate_image($info["image"]);
            if ($image->getNumberImages() > 1) {
                ImageHelpers::process_animated_image($image, $stickers, $filter);
            } else {
                ImageHelpers::process_non_animated_image($image, $stickers, $filter);
            }
            $uri = ImageHelpers::export_image($image, $info["type"]);
            $image->clear();
            $response = new HttpResponse(200, "OK", ["message" => "success", "image" => $uri]);
            $response->sendJson();
        } catch (Exception $e) {
            if (gettype($image) == "object") {
                $image->clear();
            }
            log_stuff($e->getMessage());
            $response = new HttpResponse(400, "Bad Request", ["message" => "Invalid image"]);
            $response->sendJson();
        }
    }
}
