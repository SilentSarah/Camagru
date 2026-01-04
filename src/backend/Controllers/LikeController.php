<?php

require_once __DIR__ . "/../Models/Like.php";
require_once __DIR__ . "/../Core/HttpResponse.php";

class LikeController
{
    public function toggle()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['photo_id'])) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Missing photo_id"]);
            $response->sendJson();
            return;
        }

        if (!isset($_SESSION['user'])) {
            $response = new HttpResponse(401, "Unauthorized", ["message" => "User not logged in"]);
            $response->sendJson();
            return;
        }

        $userId = $_SESSION['user'];
        $photoId = $data['photo_id'];

        $likeModel = new Like();
        // Check if like exists
        $existingLike = $likeModel->findAll(['photo_id' => $photoId, 'user_id' => $userId]);

        if (!empty($existingLike)) {
            // Unlike
            // Assuming findAll returns an array of arrays, and we need the ID of the first one
            $id = $existingLike[0]['id'];
            $likeModel->delete($id);
            $response = new HttpResponse(200, "OK", ["message" => "Unliked", "liked" => false]);
        } else {
            // Like
            $likeData = [
                'photo_id' => $photoId,
                'user_id' => $userId,
                'created_at' => gmdate("Y-m-d H:i:s")
            ];
            $likeModel->create($likeData);
            $response = new HttpResponse(201, "Created", ["message" => "Liked", "liked" => true]);
        }
        $response->sendJson();
    }
}
