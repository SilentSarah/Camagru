<?php

# MAKE SURE TO RENAME THIS FILE TO Config.php after you finish with your edits

/**
 * @property string $DB_HOST Database host
 * @property string $DB_NAME Database name
 * @property string $DB_USER Database user
 * @property string $DB_PASS Database password
 * @property array $ALLOWED_ORIGINS Array of allowed origins - CORS
 * @property array $ALLOWED_METHODS Array of allowed HTTP methods - CORS
 * @property array $ALLOWED_HEADERS Array of allowed headers - CORS
 * @property bool $ALLOW_CREDENTIALS Whether to allow credentials - CORS
 * @property string $JWT_SECRET JWT secret
 * @property string $MAILGUN_USER Mailgun username (it's usually "api")
 * @property string $MAILGUN_API_KEY Mailgun API key
 * @property string $MAILGUN_SENDER_DOMAIN Mailgun sender domain
 * @property string $MAILGUN_SENDER_FROM Mailgun sender from
 * @property string $MAILGUN_API_URL Mailgun API URL
 * @property int $VERIFICATION_EXPIRY_TIME Verification expiry time in seconds
 * @property string $FRONTEND_URL Frontend URL
 * @property array $ALLOWED_MIME_TYPES Array of allowed MIME types
 * @property int $MAX_FILE_SIZE Maximum file size in bytes
 * @property int $MIN_DIMENSION Minimum dimension in pixels
 * @property int $MAX_DIMENSION Maximum dimension in pixels
 * @property int $MAX_DESCRIPTION_LENGTH Maximum description length
 * @property string $UPLOAD_DIR Upload directory
 * @property string $TEMP_DIR Temporary directory
 * @property int $RATE_LIMIT_WINDOW Rate limit window in seconds
 * @property array $VALIDATION_RULES Validation rules
 */
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

    public const ALLOWED_HEADERS = []; // You'll need this to allow the client to see Retry-After header (CORS STUFF)
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

    public const RATE_LIMIT_WINDOW = 60;
    public const RATE_LIMIT_PUBLIC = 20;
    public const RATE_LIMIT_WRITE = 30;
    public const RATE_LIMIT_READ = 100;

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

    public static function setPostEmailTemplate(string $path): void
    {
        self::$POST_NOTIFICATION_EMAIL = file_get_contents($path);
    }
}
