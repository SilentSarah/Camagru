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
        'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'
    ];
    public const ALLOW_CREDENTIALS = true;
    public const JWT_SECRET = 'your-secret-key';

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
    public static function setValidatorVerifyFn(string $key, $verifyFn): void {
        self::$VALIDATION_RULES[$key]["verify"] = $verifyFn;
    }
}