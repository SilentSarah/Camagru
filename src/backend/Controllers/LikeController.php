<?php

require_once __DIR__ . "/../Models/Like.php";
require_once __DIR__ . "/../Models/Photo.php";
require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Core/NotificationMailer.php";

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

        $existingLike = new Like()->findAll(['photo_id' => $photoId, 'user_id' => $userId]);

        if (!empty($existingLike)) {
            $id = $existingLike[0]['id'];
            new Like()->delete($id);
            $response = new HttpResponse(200, "OK", ["message" => "Unliked", "liked" => false]);
        } else {
            $likeData = [
                'photo_id' => $photoId,
                'user_id' => $userId,
                'created_at' => gmdate("Y-m-d H:i:s")
            ];
            new Like()->create($likeData);

            try {
                $photo = new Photo()->find($photoId);
                if ($photo && $photo->getUserId()) {
                    $postOwner = new User()->find($photo->getUserId());
                    $liker = new User()->find($userId);

                    if ($postOwner && $liker) {
                        NotificationMailer::sendLikeNotification($postOwner, $liker, $photo);
                    }
                }
            } catch (Exception $e) {}

            $response = new HttpResponse(201, "Created", ["message" => "Liked", "liked" => true]);
        }
        $response->sendJson();
    }
}
