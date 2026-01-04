<?php

require_once __DIR__ . "/../Models/Comment.php";
require_once __DIR__ . "/../Core/HttpResponse.php";
require_once __DIR__ . "/../Core/Utils.php";

class CommentController
{
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['photo_id']) || empty($data['content'])) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Missing required fields"]);
            $response->sendJson();
            return;
        }

        if (!isset($_SESSION['user'])) {
            $response = new HttpResponse(401, "Unauthorized", ["message" => "User not logged in"]);
            $response->sendJson();
            return;
        }

        try {
            $comment = new Comment();
            $commentData = [
                'photo_id' => $data['photo_id'],
                'user_id' => $_SESSION['user'],
                'content' => htmlspecialchars(trim($data['content'])),
                'created_at' => gmdate("Y-m-d H:i:s")
            ];
            $created = $comment->create($commentData);
            $response = new HttpResponse(201, "Created", ["message" => "Comment added", "data" => $created]);
            $response->sendJson();
        } catch (Exception $e) {
            $response = new HttpResponse(500, "Internal Server Error", ["message" => $e->getMessage()]);
            $response->sendJson();
        }
    }

    public function get_by_photo()
    {
        if (empty($_GET['photo_id'])) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Missing photo_id"]);
            $response->sendJson();
            return;
        }

        $commentModel = new Comment();
        $comments = $commentModel->findAll(['photo_id' => $_GET['photo_id']]);

        $enrichedComments = [];
        foreach ($comments as $comment) {
            $user = new User();
            $u = $user->find($comment['user_id']);
            $comment['username'] = $u->getUsername();
            $enrichedComments[] = $comment;
        }

        $response = new HttpResponse(200, "OK", ["data" => $enrichedComments]);
        $response->sendJson();
    }
    public function delete()
    {
        $id = $_GET['id'];

        if (empty($id)) {
            $response = new HttpResponse(400, "Bad Request", ["message" => "Missing comment id"]);
            $response->sendJson();
            return;
        }

        if (!isset($_SESSION['user'])) {
            $response = new HttpResponse(401, "Unauthorized", ["message" => "User not logged in"]);
            $response->sendJson();
            return;
        }

        $commentModel = new Comment();
        $comment = $commentModel->find($id);

        if (!$comment || !$comment->getId()) {
            $response = new HttpResponse(404, "Not Found", ["message" => "Comment not found"]);
            $response->sendJson();
            return;
        }

        $photoModel = new Photo();
        $photo = $photoModel->find($comment->getPhotoId());

        $currentUserId = $_SESSION['user'];
        $isCommentAuthor = $comment->getUserId() == $currentUserId;
        $isPostAuthor = $photo && $photo->getUserId() == $currentUserId;

        if (!$isCommentAuthor && !$isPostAuthor) {
            $response = new HttpResponse(403, "Forbidden", ["message" => "You are not allowed to delete this comment"]);
            $response->sendJson();
            return;
        }

        if ($commentModel->delete($id)) {
            $response = new HttpResponse(200, "OK", ["message" => "Comment deleted"]);
            $response->sendJson();
        } else {
            $response = new HttpResponse(500, "Internal Server Error", ["message" => "Failed to delete comment"]);
            $response->sendJson();
        }
    }
}
