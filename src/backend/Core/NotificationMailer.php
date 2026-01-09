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
 * File Created: Saturday, 4th January 2026
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/../Models/Photo.php";
require_once __DIR__ . "/Request.php";
require_once __DIR__ . "/Config.php";
require_once __DIR__ . "/RateLimiter.php";

class NotificationMailer
{
    /**
     * Send a like notification email to the post owner
     */
    public static function sendLikeNotification(User $postOwner, User $liker, Photo $photo): void
    {
        if ($postOwner->getId() === $liker->getId()) {
            return;
        }

        if (!$postOwner->getEmailNotifications()) {
            return;
        }

        $rateLimiter = RateLimiter::getInstance();
        $key = "notification:like:{$postOwner->getId()}:{$photo->getId()}";
        if (!$rateLimiter->attempt($key, 1, Config::RATE_LIMIT_WINDOW)) {
            return;
        }

        $postLink = Config::FRONTEND_URL() . "/post?id=" . $photo->getId();
        $title = "Someone liked your post!";
        $action = "liked your post.";
        $commentSection = "";

        self::sendNotificationEmail(
            $postOwner->getEmail(),
            "Camagru - " . $liker->getUsername() . " liked your post",
            $title,
            $liker->getUsername(),
            $action,
            $commentSection,
            $postLink
        );
    }

    /**
     * Send a comment notification email to the post owner
     */
    public static function sendCommentNotification(User $postOwner, User $commenter, Photo $photo, string $comment): void
    {
        if ($postOwner->getId() === $commenter->getId()) {
            return;
        }

        if (!$postOwner->getEmailNotifications()) {
            return;
        }

        $rateLimiter = RateLimiter::getInstance();
        $key = "notification:comment:{$postOwner->getId()}:{$photo->getId()}";
        if (!$rateLimiter->attempt($key, 1, Config::RATE_LIMIT_WINDOW)) {
            return;
        }

        $postLink = Config::FRONTEND_URL() . "/post?id=" . $photo->getId();
        $title = "New comment on your post!";
        $action = "commented on your post:";

        $commentPreview = strlen($comment) > 100 ? substr($comment, 0, 100) . "..." : $comment;
        $commentSection = '<div class="comment-preview">"' . htmlspecialchars($commentPreview) . '"</div>';

        self::sendNotificationEmail(
            $postOwner->getEmail(),
            "Camagru - " . $commenter->getUsername() . " commented on your post",
            $title,
            $commenter->getUsername(),
            $action,
            $commentSection,
            $postLink
        );
    }

    /**
     * Send the notification email via Mailgun
     */
    private static function sendNotificationEmail(
        string $toEmail,
        string $subject,
        string $title,
        string $actorName,
        string $action,
        string $commentSection,
        string $postLink
    ): void {
        $request = new Request(Config::MAILGUN_API_URL() . Config::MAILGUN_SENDER_DOMAIN() . "/messages", "POST");
        $request->includeHeader("Content-Type", "application/json");
        $request->setCurlOption(CURLOPT_USERPWD, Config::MAILGUN_USER() . ":" . Config::MAILGUN_API_KEY());
        $request->setBody([
            "from" => Config::MAILGUN_SENDER_FROM(),
            "to" => $toEmail,
            "subject" => $subject,
            "html" => sprintf(
                Config::$POST_NOTIFICATION_EMAIL,
                $title,           // %s - Title
                $actorName,       // %s - Actor name
                $action,          // %s - Action text
                $commentSection,  // %s - Comment preview (or empty)
                $postLink,        // %s - Button href
                $postLink,        // %s - Fallback link href
                $postLink         // %s - Fallback link text
            )
        ]);
        $request->fetch();
    }
}
