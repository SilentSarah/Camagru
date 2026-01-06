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
 * File Created: Monday, 1st December 2025 5:57:50 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/Config.php";

function isSecure()
{
    return !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443;
}

function gen_server_url()
{
    return (isSecure() ? "https" : "http") . "://" . Config::APP_URL;
}


// FOR DEBUGGING PURPOSES ONLY
function log_stuff(...$stuff)
{
    file_put_contents("php://stdout", "[LOG] " . implode("\n", $stuff) . "\n");
}

function check_rate_limit($ip, $requested_method, $is_protected)
{
    $rateLimiter = RateLimiter::getInstance();

    if (!$is_protected) {
        $limit = Config::RATE_LIMIT_PUBLIC;
        $key = "api:public:{$ip}";
    } else if (in_array($requested_method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
        $limit = Config::RATE_LIMIT_WRITE;
        $key = "api:write:{$ip}";
    } else {
        $limit = Config::RATE_LIMIT_READ;
        $key = "api:read:{$ip}";
    }

    $result = $rateLimiter->attemptWithInfo($key, $limit, Config::RATE_LIMIT_WINDOW);
    return $result;
}

class ImageHelpers
{
    public static function get_base64_info($base64_uri)
    {
        $matches = [];
        if (preg_match('/^data:(?P<type>[a-zA-Z0-9\/+.-]+);base64,(?P<data>.+)$/', $base64_uri, $matches)) {
            return [
                'type' => $matches['type'],
                'size' => (int) (strlen(rtrim($matches['data'], '=')) * 0.75),
                'image' => $matches['data']
            ];
        }
        return null;
    }

    public static function allocate_image(string $image)
    {
        $allocatedImage = new Imagick();
        $blob = base64_decode($image);
        if ($blob === false) {
            throw new Exception("Invalid image");
        }
        $allocatedImage->readImageBlob($blob);
        return $allocatedImage;
    }

    public static function export_image(Imagick $image, string $mimeType)
    {
        $image->setImageFormat(str_replace('image/', '', $mimeType));
        $blob = ($image->getNumberImages() > 1) ? $image->getImagesBlob() : $image->getImageBlob();
        $base64Data = base64_encode($blob);
        $uri = (string)"data:" . $mimeType . ";base64," . $base64Data;
        return $uri;
    }

    public static function check_stickers(array $stickers)
    {
        $stickerData = [];
        if (!is_array($stickers)) {
            return false;
        }
        foreach ($stickers as $sticker) {
            $info = self::get_base64_info($sticker["imageUrl"]);
            if ($info == null) {
                return false;
            }
            if (!in_array($info["type"], Config::SUPPORTED_IMAGE_MIME_TYPES)) {
                return false;
            }
            if ($info["size"] > Config::MAX_FILE_SIZE) {
                return false;
            }
            $info["x"] = $sticker["x"];
            $info["y"] = $sticker["y"];
            $info["scale"] = $sticker["scale"];
            $stickerData[] = $info;
        }
        return $stickerData;
    }

    public static function process_non_animated_image(Imagick &$image, array $stickers, string $filters)
    {
        self::process_stickers($image, $stickers);
        self::process_filters($image, $filters);
    }

    public static function process_animated_image(Imagick &$image, array $stickers, string $filters)
    {
        $image = $image->coalesceImages();
        foreach ($image as $frame) {
            self::process_stickers($frame, $stickers);
            self::process_filters($frame, $filters);
        }
        $image = $image->deconstructImages();
    }

    public static function process_stickers(Imagick &$image, array $stickers)
    {
        foreach ($stickers as $sticker) {
            $x = floatval($sticker["x"]);
            $y = floatval($sticker["y"]);
            $scale = floatval($sticker["scale"]);

            $stickerImg = new Imagick();
            $stickerBlob = base64_decode($sticker["image"]);
            $stickerImg->readImageBlob($stickerBlob);
            $finalW = $image->getImageWidth() * $scale;
            $stickerImg->scaleImage($finalW, 0);
            $finalH = $stickerImg->getImageHeight();
            $posX = ($x * $image->getImageWidth()) - ($finalW / 2);
            $posY = ($y * $image->getImageHeight()) - ($finalH / 2);

            $image->compositeImage($stickerImg, Imagick::COMPOSITE_OVER, $posX, $posY);
            $stickerImg->clear();
        }
    }

    public static function process_filters(Imagick &$image, string $filters)
    {
        if ($filters == "") {
            return;
        }
        preg_match_all('/([\w-]+)\(([^)]+)\)/', $filters, $all_filters, PREG_SET_ORDER);
        foreach ($all_filters as [$cssfunc, $type, $value]) {
            $value = floatval($value);
            match ($type) {
                "grayscale" => $image->setImageType(Imagick::IMGTYPE_GRAYSCALEMATTE),
                "sepia" => self::applySepiaFilter($image, $value),
                "contrast" => $image->brightnessContrastImage(0, $value - 100),
                "brightness" => self::applyBrightnessFilter($image, $value),
                "hue-rotate" => self::applyHueRotateFilter($image, $value),
                "saturate" => $image->modulateImage(100, $value, 100),
            };
        }
    }

    private static function applySepiaFilter(Imagick $image, float $value)
    {
        $amount = $value / 100;
        $matrix = [
            (1 - $amount) + ($amount * 0.393),
            ($amount * 0.769),
            ($amount * 0.189),
            0,
            0,
            0,
            ($amount * 0.349),
            (1 - $amount) + ($amount * 0.686),
            ($amount * 0.168),
            0,
            0,
            0,
            ($amount * 0.272),
            ($amount * 0.534),
            (1 - $amount) + ($amount * 0.131),
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
        ];
        $image->colorMatrixImage($matrix);
    }

    /**
     * Custom filter function to apply the same brightness effect as CSS
     * @param Imagick $image
     * @param float $value
     * @return void
     */
    public static function applyBrightnessFilter(Imagick $image, float $value)
    {
        $amount = $value / 100;
        $matrix = [
            $amount,
            0,
            0,
            0,
            0,
            0,
            0,
            $amount,
            0,
            0,
            0,
            0,
            0,
            0,
            $amount,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
        ];
        $image->colorMatrixImage($matrix);
    }

    /**
     * Custom filter function to apply the same hue-rotate effect as CSS
     * @param Imagick $image
     * @param float $value (degrees)
     * @return void
     */
    public static function applyHueRotateFilter(Imagick $image, float $value)
    {
        $rad = deg2rad($value);
        $cos = cos($rad);
        $sin = sin($rad);

        $a00 = 0.213 + $cos * 0.787 - $sin * 0.213;
        $a01 = 0.715 - $cos * 0.715 - $sin * 0.715;
        $a02 = 0.072 - $cos * 0.072 + $sin * 0.928;

        $a10 = 0.213 - $cos * 0.213 + $sin * 0.143;
        $a11 = 0.715 + $cos * 0.285 + $sin * 0.140;
        $a12 = 0.072 - $cos * 0.072 - $sin * 0.283;

        $a20 = 0.213 - $cos * 0.213 - $sin * 0.787;
        $a21 = 0.715 - $cos * 0.715 + $sin * 0.715;
        $a22 = 0.072 + $cos * 0.928 + $sin * 0.072;

        $matrix = [
            $a00,
            $a01,
            $a02,
            0,
            0,
            0,
            $a10,
            $a11,
            $a12,
            0,
            0,
            0,
            $a20,
            $a21,
            $a22,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
        ];
        $image->colorMatrixImage($matrix);
    }
}
