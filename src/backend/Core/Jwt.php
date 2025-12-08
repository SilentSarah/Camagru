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
 * File Created: Wednesday, 26th November 2025 11:16:53 am
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/Config.php";

const ALGOS = [
    "HS256" => "sha256",
    "HS384" => "sha384",
    "HS512" => "sha512",
];

function generate_base64_padding(int $length): string
{
    return str_repeat("=", $length);
}

function convert_b64_to_b64url(string $b64): string
{
    return str_replace(
        "=",
        "",
        str_replace(
            "+",
            "-",
            str_replace("/", "_", $b64)
        )
    );
}

function convert_b64url_to_b64(string $b64url): string
{
    $remainder = strlen($b64url) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $b64url .= str_repeat("=", $padlen);
    }
    return str_replace(
        "_",
        "/",
        str_replace("-", "+", $b64url)
    );
}

function generate_jwt_token(string $algo, array $claims): string
{
    $header = [
        "alg" => $algo,
        "typ" => "JWT"
    ];

    $header64 = base64_encode(json_encode($header));
    $payload64 = base64_encode(json_encode($claims));

    $header64URL = convert_b64_to_b64url($header64);
    $payload64URL = convert_b64_to_b64url($payload64);

    $token = $header64URL . "." . $payload64URL;

    $signature = hash_hmac(ALGOS[$algo], $token, Config::JWT_SECRET, true);
    $signature64URL = convert_b64_to_b64url(base64_encode($signature));

    return $token . "." . $signature64URL;
}

function verify_jwt_token(string $token): bool
{
    $parts = explode(".", $token);
    if (count($parts) !== 3) {
        return false;
    }

    [$header64URL, $payload64URL, $signature64URL] = $parts;

    $header64 = convert_b64url_to_b64($header64URL);
    $header = json_decode(base64_decode($header64), true);

    if (!isset($header["alg"]) || !isset(ALGOS[$header["alg"]])) {
        return false;
    }

    $algo = $header["alg"];
    $signingInput = $header64URL . "." . $payload64URL;

    $payload = convert_b64url_to_b64($payload64URL);
    $payload = json_decode(base64_decode($payload), true);

    $expectedSignature = hash_hmac(ALGOS[$algo], $signingInput, Config::JWT_SECRET, true);
    $expectedSignature64URL = convert_b64_to_b64url(base64_encode($expectedSignature));

    if ($payload["exp"] < time()) {
        return false;
    }

    return $signature64URL === $expectedSignature64URL;
}

function get_jwt_claims(string $token): array
{
    $parts = explode(".", $token);
    if (count($parts) !== 3) {
        return [];
    }

    $payload64URL = $parts[1];
    $payload64 = convert_b64url_to_b64($payload64URL);
    $payload = json_decode(base64_decode($payload64), true);

    return $payload ?? [];
}
