<?php
class Config
{
    public static function DB_HOST()
    {
        return getenv("DB_HOST");
    }
    public static function DB_NAME()
    {
        return getenv("DB_NAME");
    }
    public static function DB_USER()
    {
        return getenv("DB_USER");
    }
    public static function DB_PASS()
    {
        return  getenv("DB_PASS");
    }
    public static function ALLOWED_ORIGINS()
    {
        return explode(",", getenv("ALLOWED_ORIGINS"));
    }
    public static function ALLOWED_METHODS()
    {
        return explode(",", getenv("ALLOWED_METHODS")) ?: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];
    }
    public const ALLOW_CREDENTIALS = true;

    public static function ALLOWED_HEADERS()
    {
        return explode(",", getenv("ALLOWED_HEADERS")) ?: ["Retry-After"];
    }

    public static function JWT_SECRET()
    {
        return getenv("JWT_SECRET") ?: "your-jwt-secret";
    }
    public static function MAILGUN_USER()
    {
        return getenv("MAILGUN_USER") ?: "api";
    } // From their docs idk why it's called "api"
    public static function MAILGUN_API_KEY()
    {
        return getenv("MAILGUN_API_KEY");
    }
    public static function MAILGUN_SENDER_DOMAIN()
    {
        return getenv("MAILGUN_SENDER_DOMAIN");
    }
    public static function MAILGUN_SENDER_FROM()
    {
        return getenv("MAILGUN_SENDER_FROM");
    }
    public static function MAILGUN_API_URL()
    {
        return getenv("MAILGUN_API_URL") ?: "http://api.eu.mailgun.net/v3/";
    }
    public const VERIFICATION_EXPIRY_TIME = 900;
    public static function FRONTEND_URL()
    {
        return getenv("FRONTEND_URL");
    }
    public static function APP_URL()
    {
        return getenv("APP_URL");
    }
    public const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    // Image constraints
    public const MAX_FILE_SIZE = 10_000_000; // 10MB
    public const MIN_DIMENSION = 100;
    public const MAX_DIMENSION = 4096;
    public const MAX_DESCRIPTION_LENGTH = 128;
    public const UPLOAD_DIR = '/var/www/html/uploads/';

    /**
     * 
     * @deprecated No longer saving temporary proccessed images
     */
    public const TEMP_DIR = '/var/www/html/uploads/temp/';

    public const array SUPPORTED_IMAGE_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/x-icon',
        'image/heic',
        'image/heif',
        'image/avif',
        'image/apng'
    ];

    public const RATE_LIMIT_WINDOW = 60;
    public const RATE_LIMIT_PUBLIC = 150;

    public const RATE_LIMIT_WRITE = 30;
    public const RATE_LIMIT_READ = 100;

    public static array $VALIDATION_RULES = [
        "username" => [
            "required" => true,
            "minlength" => 3,
            "maxlength" => 24,
            "includeAlpha" => true,
        ],
        "password" => [
            "required" => true,
            "minlength" => 8,
            "maxlength" => 20,
            "symbols" => true,
            "includeAlpha" => true,
            "includeNumber" => true
        ],
        "fullname" => [
            "required" => true,
            "minlength" => 3,
            "maxlength" => 50,
            "includeAlpha" => true,
        ],
        "email" => [
            "required" => true,
            "minlength" => 5,
            "maxlength" => 100,
            "verify" => null,
        ],
    ];

    public static string $VERIFICATION_EMAIL = "";
    public static string $RESET_PASSWORD_EMAIL = "";
    public static string $POST_NOTIFICATION_EMAIL = "";


    /**
     * inserts a custom validation function for your desired key
     * @param string $key The key that will house the validation function
     * @param mixed $verifyFn Callable to the custom validation function
     * @return void
     */
    public static function setValidatorVerifyFn(string $key, $verifyFn): void
    {
        self::$VALIDATION_RULES[$key]["verify"] = $verifyFn;
    }

    public static function setVerificationEmailTemplate(string $path): void
    {
        self::$VERIFICATION_EMAIL = file_get_contents($path);
    }

    public static function setPasswordResetEmailTemplate(string $path): void
    {
        self::$RESET_PASSWORD_EMAIL = file_get_contents($path);
    }

    public static function setPostEmailTemplate(string $path): void
    {
        self::$POST_NOTIFICATION_EMAIL = file_get_contents($path);
    }
}
