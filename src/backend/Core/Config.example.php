<?php

# MAKE SURE TO RENAME THIS FILE TO Config.php after you finish with your edits
class Config
{
    public const DB_HOST = 'localhost';
    public const DB_NAME = 'db';
    public const DB_USER = 'root';
    public const DB_PASS = 'root';

    public const ALLOWED_ORIGINS = [
        'http://localhost:3000',
    ];
    public const ALLOWED_METHODS = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS'
    ];
    public const ALLOW_CREDENTIALS = true;
    public const JWT_SECRET = 'your-secret-key';
    public const MAILGUN_USER = "your_api_user";
    public const MAILGUN_API_KEY = "your_api_key";
    public const MAILGUN_SENDER_DOMAIN = "your_sender_domain";
    public const MAILGUN_SENDER_FROM = "your_sender_from";
    public const MAILGUN_API_URL = "your_api_url";
    public const VERIFICATION_EXPIRY_TIME = 900;
    public const FRONTEND_URL = "your_frontend_url";

    public const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    public const MAX_FILE_SIZE = 10 * 1024 * 1024;
    public const MIN_DIMENSION = 100;
    public const MAX_DIMENSION = 4096;
    public const MAX_DESCRIPTION_LENGTH = 128;

    // Upload directories
    public const UPLOAD_DIR = __DIR__ . '/../static/uploads/';
    public const TEMP_DIR = __DIR__ . '/../static/temp/';

    public const SUPPORTED_IMAGE_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    /**
     * keys that will be checked against the rules
     * for more information please visit Validation.php file
     * Example usage:
     * ```js
     * const VALIDATION_RULES = [
     *      "username" => [
     *          "required" => true,
     *          "minlength" => 3,
     *          "maxlength" => 20,
     *          "symbols" => true,
     *          "includeAlpha" => true,
     *          "includeNumber" => true
     *      ],
     * ]
     * ```
     */
    public static $VALIDATION_RULES = [];
    public static function setValidatorVerifyFn(string $key, $verifyFn): void
    {
        self::$VALIDATION_RULES[$key]["verify"] = $verifyFn;
    }

    public static function setVerificationEmailTemplate(string $path): void
    {
        self::$VERIFICATION_EMAIL = file_get_contents($path);
    }
}
