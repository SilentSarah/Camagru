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
 * File Created: Monday, 1st December 2025 2:39:06 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

/**
 * Request Class for making HTTP requests, 
 * Uses curl under the hood to make requests
 */
class Request {
    private array $headers;
    private array $body;
    private array $query;
    private array $cookies;
    private array $files;
    private string $method;
    private string $url;

    private CurlHandle $instance;

    public function __construct(string $url, string $method) {
        $this->instance = curl_init( $url );
        $this->url = $url;
        $this->method = $method;
    }

    public function getMethod(): string {
        return $this->method;
    }

    public function getUrl(): string {
        return $this->url;
    }

    public function getHeaders(): array {
        return $this->headers;
    }

    public function getBody(): array {
        return $this->body;
    }

    public function getQuery(): array {
        return $this->query;
    }

    public function getCookies(): array {
        return $this->cookies;
    }

    public function getFiles(): array {
        return $this->files;
    }

    public function setHeaders(array $headers): void {
        $this->headers = $headers;
    }

    public function includeHeader(string $name, $value): void {
        $this->headers[$name] = $value;
    }

    public function includeCookie(string $name, $value): void {
        $this->cookies[$name] = $value;
    }

    public function setBody(array $body): void {
        $this->body = $body;
    }

    public function setQuery(array $query): void {
        $this->query = $query;
    }

    public function setCookies(array $cookies): void {
        $this->cookies = $cookies;
    }

    public function setFiles(array $files): void {
        $this->files = $files;
    }

    public function setMethod(string $method): void {
        $this->method = $method;
    }

    public function setUrl(string $url): void {
        $this->url = $url;
    }

    public function setCurlOption(int $option, mixed $value): void {
        curl_setopt($this->instance, $option, $value);
    }

    public function fetch() {
        $this->setCurlOption(CURLOPT_RETURNTRANSFER, true);
        $this->setCurlOption(CURLOPT_CUSTOMREQUEST, $this->method);
        $this->setCurlOption(CURLOPT_HTTPHEADER, $this->headers);
        $this->setCurlOption(CURLOPT_POSTFIELDS, http_build_query($this->body));
        $response = curl_exec($this->instance);
        return $response;
    }
}
