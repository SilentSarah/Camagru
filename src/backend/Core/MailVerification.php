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
 * File Created: Monday, 1st December 2025 1:34:33 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/Request.php";
require_once __DIR__ . "/Utils.php";
require_once __DIR__ . "/Config.php";

function sendVerifcationMail(User $user)
{
    if ($user->isVerified()) {
        return;
    }
    $v_token = bin2hex(random_bytes(16));
    $v_gen_time = time();
    $user->setVerificationToken($v_token);
    $user->setVerificationTokenGenDate($v_gen_time);
    $user->save();

    $vlink = Config::FRONTEND_URL() . "/verify?token=" . $user->getVerificationToken();
    $logo = Config::FRONTEND_URL() . "/public/CG.svg";

    $request = new Request(Config::MAILGUN_API_URL() . Config::MAILGUN_SENDER_DOMAIN() . "/messages", "POST");
    $request->includeHeader("Content-Type", "application/json");
    $request->setCurlOption(CURLOPT_USERPWD, Config::MAILGUN_USER() . ":" . Config::MAILGUN_API_KEY());
    $request->setBody([
        "from" => Config::MAILGUN_SENDER_FROM(),
        "to" => $user->getEmail(),
        "subject" => "Camagru - Verify your email address",
        "html" => sprintf(Config::$VERIFICATION_EMAIL, $logo, $vlink, $vlink, $vlink)
    ]);
    $request->fetch();
}

function sendPasswordRecoveryEmail(User $user)
{
    $r_token = bin2hex(random_bytes(16));
    $r_expires = time() + 3600;
    $user->setResetToken($r_token);
    $user->setResetTokenExpires($r_expires);
    $user->save();

    $logo = Config::FRONTEND_URL() . "/public/CG.svg";
    $rlink = Config::FRONTEND_URL() . "/reset-password?token=" . $user->getResetToken();

    $request = new Request(Config::MAILGUN_API_URL() . Config::MAILGUN_SENDER_DOMAIN() . "/messages", "POST");
    $request->includeHeader("Content-Type", "application/json");
    $request->setCurlOption(CURLOPT_USERPWD, Config::MAILGUN_USER() . ":" . Config::MAILGUN_API_KEY());
    $request->setBody([
        "from" => Config::MAILGUN_SENDER_FROM(),
        "to" => $user->getEmail(),
        "subject" => "Camagru - Reset your password",
        "html" => sprintf(Config::$RESET_PASSWORD_EMAIL, $logo, $rlink, $rlink, $rlink)
    ]);
    $request->fetch();
}
