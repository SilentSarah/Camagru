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
 * File Created: Sunday, 30th November 2025 5:34:38 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

/**
 * Error messages for each rule
 */
const messages = [
    "required"=> "The %s is required",
    "minlength"=> "The minimum length of %s must be at least %d characters long",
    "maxlength"=> "The maximum length of %s must be at most %d characters long",
    "symbols"=> "The %s must contain symbols",
    "includeAlpha"=> "The %s must contain letters",
    "includeNumber"=> "The %s must contain numbers",
    "verify"=> "The %s is not valid",
];

/**
 * Simple Validator class inspired by zod validation library.
 * for now it only supports the following rules:
 * - required: boolean
 * - minlength: int
 * - maxlength: int
 * - symbols: boolean
 * - includeAlpha: boolean
 * - includeNumber: boolean
 * Instance is created using getInstance method
 */
class Validator {
    private static ?Validator $instance = null;
    private array $rules;

    private function __construct(array $rules) {
        $this->rules = $rules;
    }
    
    public function validate(array $data): array {
        $errors = [];
        foreach ($this->rules as $field => $rules) {
            foreach ($rules as $rule => $value) {
                if ($rule === "required" && empty($data[$field])) {
                    $errors[$field][] = sprintf(messages[$rule], $field);
                } 
                elseif ($rule === "minlength" && strlen($data[$field]) < $value) {
                    $errors[$field][] = sprintf(messages[$rule], $field, $value);
                } 
                elseif ($rule === "maxlength" && strlen($data[$field]) > $value) {
                    $errors[$field][] = sprintf(messages[$rule], $field, $value);
                } 
                elseif ($rule === "symbols" && $value && !preg_match('/[^A-Za-z0-9]/', $data[$field])) {
                    $errors[$field][] = sprintf(messages[$rule], $field);
                } 
                elseif ($rule === "includeAlpha" && $value && !preg_match('/[A-Za-z]/', $data[$field])) {
                    $errors[$field][] = sprintf(messages[$rule], $field);
                } 
                elseif ($rule === "includeNumber" && $value && !preg_match('/[0-9]/', $data[$field])) {
                    $errors[$field][] = sprintf(messages[$rule], $field);
                } 
                elseif ($rule === "verify" && $value($data[$field]) === false) {
                    $errors[$field][] = sprintf(messages[$rule], $field);
                }
            }
        }
        return $errors;
    }

    public function validateField(string $key, array $data): array {
        $errors = [];
        foreach ($this->rules[$key] as $rule => $value) {
            if ($rule === "required" && empty($data[$key])) {
                $errors[] = sprintf(messages[$rule], $key);
            } 
            elseif ($rule === "minlength" && strlen($data[$key]) < $value) {
                $errors[] = sprintf(messages[$rule], $key, $value);
            } 
            elseif ($rule === "maxlength" && strlen($data[$key]) > $value) {
                $errors[] = sprintf(messages[$rule], $key, $value);
            } 
            elseif ($rule === "symbols" && $value && !preg_match('/[^A-Za-z0-9]/', $data[$key])) {
                $errors[] = sprintf(messages[$rule], $key);
            } 
            elseif ($rule === "includeAlpha" && $value && !preg_match('/[A-Za-z]/', $data[$key])) {
                $errors[] = sprintf(messages[$rule], $key);
            } 
            elseif ($rule === "includeNumber" && $value && !preg_match('/[0-9]/', $data[$key])) {
                $errors[] = sprintf(messages[$rule], $key);
            } 
            elseif ($rule === "verify" && $value($data[$key]) === false) {
                $errors[] = sprintf(messages[$rule], $key);
            }
        }
        return $errors;
    }

    public static function getInstance(?array $rules = null): Validator {
        if (self::$instance === null) {
            self::$instance = new Validator($rules);
        }
        return self::$instance;
    }
}