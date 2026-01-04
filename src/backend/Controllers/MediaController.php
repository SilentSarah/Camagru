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
require_once __DIR__ . "/../Models/Like.php";
require_once __DIR__ . "/../Models/Comment.php";
require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Core/Config.php";
require_once __DIR__ . "/../Core/Utils.php";

class MediaController
{
    public function get_photos()
    {
        $cursor = $_GET["cursor"] ?? 0;
        $limit = $_GET["limit"] ?? 6;

        if (empty($_GET["user_id"])) {
            $_GET["user_id"] = $_SESSION["user"];
        }

        $photoModel = new Photo();
        $photos = $photoModel->findAll([
            "user_id" => $_GET["user_id"],
        ], ["id" => "DESC"], $limit, $cursor);

        $enrichedPhotos = array_map(function ($photo) {
            $photo["image_url"] = gen_server_url() . "/uploads?image=" . $photo["id"];

            $userModel = new User();
            $author = $userModel->find($photo["user_id"]);
            if ($author && $author->getId()) {
                $photo["user"] = [
                    "id" => $author->getId(),
                    "username" => $author->getUsername(),
                    "profile_picture_url" => $author->getProfilePicUrl(),
                ];
            } else {
                $photo["user"] = null;
            }

            $likeModel = new Like();
            $likes = $likeModel->findAll(["photo_id" => $photo["id"]]);
            $photo["likes"] = count($likes);
            $photo["is_liked_by_user"] = false;
            if (isset($_SESSION["user"])) {
                foreach ($likes as $like) {
                    if ($like["user_id"] == $_SESSION["user"]) {
                        $photo["is_liked_by_user"] = true;
                        break;
                    }
                }
            }

            $commentModel = new Comment();
            $comments = $commentModel->findAll(["photo_id" => $photo["id"]]);

            $enrichedComments = [];
            foreach ($comments as $comment) {
                $commentUser = $userModel->find($comment["user_id"]);
                if ($commentUser && $commentUser->getId()) {
                    $comment["user"] = [
                        "id" => $commentUser->getId(),
                        "username" => $commentUser->getUsername(),
                        "profile_picture_url" => $commentUser->getProfilePicUrl(),
                    ];
                } else {
                    $comment["user"] = [
                        "username" => "Unknown",
                        "profile_picture_url" => null
                    ];
                }
                $enrichedComments[] = $comment;
            }

            $photo["comments"] = $enrichedComments;
            $photo["comments_count"] = count($comments);

            return $photo;
        }, $photos);

        $photos_count = $photoModel->count([
            "user_id" => $_GET["user_id"],
        ]);

        $response = new HttpResponse(200, "OK", ["message" => "success", "data" => $enrichedPhotos, "posts" => $photos_count]);
        $response->sendJson();
    }

    public function get_feed()
    {
        $cursor = $_GET["cursor"] ?? 0;
        $limit = $_GET["limit"] ?? 10;
        $currentUserId = $_SESSION["user"] ?? null;

        $photoModel = new Photo();

        // First, try to get posts excluding current user
        $photos = [];
        if ($currentUserId) {
            $photos = $photoModel->findAllExcluding(
                ["user_id" => $currentUserId],
                ["id" => "DESC"],
                $limit,
                $cursor
            );
        }

        // If not enough posts from others, fill with current user's posts
        if (count($photos) < $limit) {
            $remaining = $limit - count($photos);
            $allPhotos = $photoModel->findAll([], ["id" => "DESC"], $remaining, $cursor + count($photos));

            // Filter out duplicates and add remaining
            $existingIds = array_column($photos, 'id');
            foreach ($allPhotos as $photo) {
                if (!in_array($photo['id'], $existingIds)) {
                    $photos[] = $photo;
                    if (count($photos) >= $limit) break;
                }
            }
        }

        $enrichedPhotos = array_map(function ($photo) {
            $photo["image_url"] = gen_server_url() . "/uploads?image=" . $photo["id"];

            $userModel = new User();
            $author = $userModel->find($photo["user_id"]);
            if ($author && $author->getId()) {
                $photo["user"] = [
                    "id" => $author->getId(),
                    "username" => $author->getUsername(),
                    "profile_picture_url" => $author->getProfilePicUrl(),
                ];
            } else {
                $photo["user"] = null;
            }

            $likeModel = new Like();
            $likes = $likeModel->findAll(["photo_id" => $photo["id"]]);
            $photo["likes"] = count($likes);
            $photo["is_liked_by_user"] = false;
            if (isset($_SESSION["user"])) {
                foreach ($likes as $like) {
                    if ($like["user_id"] == $_SESSION["user"]) {
                        $photo["is_liked_by_user"] = true;
                        break;
                    }
                }
            }

            $commentModel = new Comment();
            $comments = $commentModel->findAll(["photo_id" => $photo["id"]]);
            $photo["comments_count"] = count($comments);

            return $photo;
        }, $photos);

        $response = new HttpResponse(200, "OK", ["message" => "success", "data" => $enrichedPhotos]);
        $response->sendJson();
    }

    public function get_photo()
    {
        $photoId = $_GET["id"] ?? null;

        if (!$photoId) {
            $response = new HttpResponse(400, "Bad Request", ["error" => "Photo ID is required"]);
            $response->sendJson();
            return;
        }

        $photoModel = new Photo();
        $photoObj = $photoModel->find($photoId);

        if (!$photoObj || !$photoObj->getId()) {
            $response = new HttpResponse(404, "Not Found", ["error" => "Photo not found"]);
            $response->sendJson();
            return;
        }

        $createdAt = $photoObj->getCreatedAt();
        $photo = [
            "id" => $photoObj->getId(),
            "user_id" => $photoObj->getUserId(),
            "file_name" => $photoObj->getFileName(),
            "description" => $photoObj->getDescription(),
            "created_at" => $createdAt instanceof DateTime ? $createdAt->format('Y-m-d H:i:s') : $createdAt,
        ];

        $userModel = new User();
        $author = $userModel->find($photo["user_id"]);
        if ($author && $author->getId()) {
            $photo["user"] = [
                "id" => $author->getId(),
                "username" => $author->getUsername(),
                "profile_picture_url" => $author->getProfilePicUrl(),
            ];
        } else {
            $photo["user"] = null;
        }

        $likeModel = new Like();
        $likes = $likeModel->findAll(["photo_id" => $photo["id"]]);
        $photo["likes"] = count($likes);
        $photo["is_liked_by_user"] = false;
        if (isset($_SESSION["user"])) {
            foreach ($likes as $like) {
                if ($like["user_id"] == $_SESSION["user"]) {
                    $photo["is_liked_by_user"] = true;
                    break;
                }
            }
        }

        $commentModel = new Comment();
        $comments = $commentModel->findAll(["photo_id" => $photo["id"]]);
        $enrichedComments = [];
        foreach ($comments as $comment) {
            $commentUser = $userModel->find($comment["user_id"]);
            if ($commentUser && $commentUser->getId()) {
                $comment["user"] = [
                    "id" => $commentUser->getId(),
                    "username" => $commentUser->getUsername(),
                    "profile_picture_url" => $commentUser->getProfilePicUrl(),
                ];
            } else {
                $comment["user"] = [
                    "username" => "Unknown",
                    "profile_picture_url" => null
                ];
            }
            $enrichedComments[] = $comment;
        }
        $photo["comments"] = $enrichedComments;
        $photo["comments_count"] = count($comments);
        $photo["image_url"] = gen_server_url() . "/uploads?image=" . $photo["id"];

        $response = new HttpResponse(200, "OK", ["message" => "success", "data" => $photo]);
        $response->sendJson();
    }


    public function render_photo()
    {
        $image_id = $_GET["image"] ?? null;
        $profile_image_id = $_GET["pimage"] ?? null;

        try {
            if (empty($image_id) && empty($profile_image_id)) {
                $response = new HttpResponse(400, "Bad Request", ["message" => "Missing image parameter"]);
                $response->sendJson();
                return;
            }

            if (!empty($image_id) && !empty($profile_image_id)) {
                $response = new HttpResponse(400, "Bad Request", ["message" => "Cannot specify both image and pimage parameters"]);
                $response->sendJson();
                return;
            }

            $filename = !empty($image_id) ? $image_id : $profile_image_id;

            if (strpos($filename, '..') !== false || strpos($filename, '/') !== false) {
                $response = new HttpResponse(400, "Bad Request", ["message" => "Invalid filename"]);
                $response->sendJson();
                return;
            }

            $filepath = Config::UPLOAD_DIR . $filename;
            if (!file_exists($filepath)) {
                $response = new HttpResponse(404, "Not Found", ["message" => "File not found"]);
                $response->sendJson();
                return;
            }

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $filepath);

            $data = file_get_contents($filepath);

            $response = new HttpResponse(200, $data, []);
            $response->setHeader("Content-Type", $mimeType);
            $response->sendRaw();
        } catch (Exception $e) {
            $response = new HttpResponse(500, "Internal Server Error", ["message" => $e->getMessage()]);
            $response->sendJson();
        }
    }

    public function process_image()
    {
        $image = $_POST["image"];
        $filter = $_POST["filter"];
        $stickers = json_decode($_POST["stickers"], true);
        $info = ImageHelpers::get_base64_info($image);
        if ($info == null) {
            $response = new HttpResponse(422, "Unprocessable Entity", ["message" => "Invalid image"]);
            $response->sendJson();
            return;
        }

        if (!in_array($info["type"], Config::SUPPORTED_IMAGE_MIME_TYPES)) {
            $response = new HttpResponse(415, "Unsupported Media Type", ["message" => "Invalid image type"]);
            $response->sendJson();
            return;
        }

        if ($info["size"] > Config::MAX_FILE_SIZE) {
            $response = new HttpResponse(413, "Payload Too Large", ["message" => "Max file size is 10MB"]);
            $response->sendJson();
            return;
        }
        $stickers = ImageHelpers::check_stickers($stickers);
        if ($stickers === false) {
            $response = new HttpResponse(422, "Unprocessable Entity", ["message" => "Invalid stickers"]);
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
            $response = new HttpResponse(201, "Created", ["message" => "success", "image" => $uri]);
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

    public function upload_post()
    {
        $image = $_FILES["image"];
        $description = $_POST["description"];
        if (!empty($description) && strlen($description) > 255) {
            $response = new HttpResponse(422, "Unprocessable Entity", ["message" => "Description too long"]);
            $response->sendJson();
            return;
        }

        try {
            if ($image["size"] > Config::MAX_FILE_SIZE) {
                $response = new HttpResponse(413, "Payload Too Large", ["message" => "Max file size is 10MB"]);
                $response->sendJson();
                return;
            }

            switch ($image['error']) {
                case UPLOAD_ERR_OK:
                    break;
                case UPLOAD_ERR_NO_FILE:
                    throw new RuntimeException('No file sent.', 422);
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    throw new RuntimeException('Exceeded filesize limit.', 413);
                default:
                    throw new RuntimeException('Unknown errors.', 400);
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $file_type = $finfo->file($image['tmp_name']);
            $ext = explode("/", $file_type)[1];

            if (!in_array($file_type, Config::SUPPORTED_IMAGE_MIME_TYPES)) {
                throw new RuntimeException('Invalid file format.', 415);
            }

            $file_name = sha1_file($image['tmp_name']) . time();
            $moved = move_uploaded_file(
                $image['tmp_name'],
                sprintf(
                    "%s%s.%s",
                    Config::UPLOAD_DIR,
                    $file_name,
                    $ext
                )
            );

            if (!$moved) {
                throw new RuntimeException('Failed to move uploaded file.', 500);
            }

            $photo = new Photo();
            $photo->create([
                "user_id" => $_SESSION["user"],
                "description" => $description,
                "file_name" => $file_name . "." . $ext,
            ]);
            $response = new HttpResponse(201, "Created", ["message" => "success"]);
            $response->sendJson();
        } catch (Exception $e) {
            log_stuff($e->getMessage());
            $response = new HttpResponse((int)$e->getCode(), "Bad Request", ["message" => $e->getMessage()]);
            $response->sendJson();
        }
    }
    public function delete_post()
    {
        $id = $_GET["id"];
        if (empty($id)) {
            $response = new HttpResponse(400, "Bad Request", ["error" => "Missing post id"]);
            $response->sendJson();
            return;
        }

        $photo = new Photo()->find($id);
        if ($photo->getId() == null) {
            $response = new HttpResponse(404, "Not Found", ["error" => "Post not found"]);
            $response->sendJson();
            return;
        }

        if ($photo->getUserId() != $_SESSION["user"]) {
            $response = new HttpResponse(403, "Forbidden", ["error" => "You are not the author of this post"]);
            $response->sendJson();
            return;
        }

        if ($photo->remove()) {
            $response = new HttpResponse(204, "OK", ["message" => "Post deleted successfully"]);
            $response->sendJson();
        } else {
            $response = new HttpResponse(500, "Internal Server Error", ["error" => "Failed to delete post"]);
            $response->sendJson();
        }
    }

    public function upload_profile_picture()
    {
        if (!isset($_FILES['profile_picture'])) {
            $response = new HttpResponse(400, "Bad Request", ["error" => "No file uploaded"]);
            $response->sendJson();
            return;
        }

        $image = $_FILES["profile_picture"];

        log_stuff(print_r($image, true));

        try {
            if ($image["size"] > Config::MAX_FILE_SIZE) {
                $response = new HttpResponse(413, "Payload Too Large", ["error" => "Max file size is 10MB"]);
                $response->sendJson();
                return;
            }

            switch ($image['error']) {
                case UPLOAD_ERR_OK:
                    break;
                case UPLOAD_ERR_NO_FILE:
                    throw new RuntimeException('No file sent.', 422);
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    throw new RuntimeException('Exceeded filesize limit.', 413);
                default:
                    throw new RuntimeException('Unknown errors.', 400);
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $file_type = $finfo->file($image['tmp_name']);
            $ext = explode("/", $file_type)[1];

            if (!in_array($file_type, Config::SUPPORTED_IMAGE_MIME_TYPES)) {
                throw new RuntimeException('Invalid file format.', 415);
            }

            $file_name = "profile_" . $_SESSION["user"];
            $moved = move_uploaded_file(
                $image['tmp_name'],
                sprintf(
                    "%s%s.%s",
                    Config::UPLOAD_DIR,
                    $file_name,
                    $ext
                )
            );

            if (!$moved) {
                throw new RuntimeException('Failed to move uploaded file.', 500);
            }

            $user = new User();
            $user->find($_SESSION["user"]);
            $user->setProfilePicUrl(gen_server_url() . "/uploads?pimage=" . $file_name . "." . $ext);
            $user->save();

            log_stuff($user->getProfilePicUrl());

            $response = new HttpResponse(200, "OK", [
                "message" => "Profile picture updated",
                "profile_pic_url" => gen_server_url() . "/uploads?pimage=" . $file_name . "." . $ext
            ]);
            $response->sendJson();
        } catch (Exception $e) {
            log_stuff($e->getMessage());
            $response = new HttpResponse((int)$e->getCode(), "Bad Request", ["error" => $e->getMessage()]);
            $response->sendJson();
        }
    }
}
