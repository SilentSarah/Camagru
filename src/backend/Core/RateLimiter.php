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

require_once __DIR__ . "/Utils.php";

/**
 * Simple file-based rate limiter with key-value storage and TTL support
 */
class RateLimiter
{
    private static ?RateLimiter $instance = null;
    private string $cacheDir;

    private function __construct()
    {
        $this->cacheDir = sys_get_temp_dir() . '/camagru_ratelimit';
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }

    /**
     * Get singleton instance
     */
    public static function getInstance(): RateLimiter
    {
        if (self::$instance === null) {
            self::$instance = new RateLimiter();
        }
        return self::$instance;
    }

    /**
     * Get the file path for a key
     */
    private function getFilePath(string $key): string
    {
        return $this->cacheDir . '/' . md5($key) . '.json';
    }

    /**
     * Set a value with optional TTL (time to live in seconds)
     * 
     * @param string $key The key to store
     * @param mixed $value The value to store
     * @param int|null $ttl Time to live in seconds (null = no expiration)
     * @return bool Success
     */
    public function set(string $key, mixed $value, ?int $ttl = null): bool
    {
        $data = [
            'value' => $value,
            'created_at' => time(),
            'expires_at' => $ttl !== null ? time() + $ttl : null
        ];

        return file_put_contents($this->getFilePath($key), json_encode($data)) !== false;
    }

    /**
     * Get a value by key, returns null if expired or not found
     * 
     * @param string $key The key to retrieve
     * @return mixed|null The value or null if not found/expired
     */
    public function get(string $key): mixed
    {
        $filePath = $this->getFilePath($key);

        if (!file_exists($filePath)) {
            return null;
        }

        $content = file_get_contents($filePath);
        if ($content === false) {
            return null;
        }

        $data = json_decode($content, true);
        if ($data === null) {
            return null;
        }

        if ($data['expires_at'] !== null && time() > $data['expires_at']) {
            $this->delete($key);
            return null;
        }

        return $data['value'];
    }

    /**
     * Check if a key exists and is not expired
     * 
     * @param string $key The key to check
     * @return bool Whether the key exists
     */
    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }

    /**
     * Delete a key
     * 
     * @param string $key The key to delete
     * @return bool Success
     */
    public function delete(string $key): bool
    {
        $filePath = $this->getFilePath($key);
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        return true;
    }

    /**
     * Increment a counter, creates if doesn't exist
     * 
     * @param string $key The key to increment
     * @param int $amount Amount to increment by
     * @param int|null $ttl TTL for new keys (ignored if key exists)
     * @return int The new value
     */
    public function increment(string $key, int $amount = 1, ?int $ttl = null): int
    {
        $current = $this->get($key);
        $newValue = ($current ?? 0) + $amount;

        $filePath = $this->getFilePath($key);
        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            $data = json_decode($content, true);
            $expiresAt = $data['expires_at'] ?? null;

            $newData = [
                'value' => $newValue,
                'created_at' => $data['created_at'] ?? time(),
                'expires_at' => $expiresAt
            ];
            file_put_contents($filePath, json_encode($newData));
        } else {
            $this->set($key, $newValue, $ttl);
        }

        return $newValue;
    }

    /**
     * Check rate limit - returns true if action is allowed, false if rate limited
     * 
     * @param string $key Unique identifier for the rate limit
     * @param int $maxAttempts Maximum attempts allowed
     * @param int $windowSeconds Time window in seconds
     * @return bool True if allowed, false if rate limited
     */
    public function attempt(string $key, int $maxAttempts = 1, int $windowSeconds = 60): bool
    {
        $count = $this->get($key);

        if ($count === null) {
            $this->set($key, 1, $windowSeconds);
            return true;
        }

        if ($count >= $maxAttempts) {
            return false;
        }

        $this->increment($key);
        return true;
    }

    /**
     * Get time remaining until a key expires
     * 
     * @param string $key The key to check
     * @return int Seconds remaining, 0 if expired or not found
     */
    public function getTimeRemaining(string $key): int
    {
        $filePath = $this->getFilePath($key);

        if (!file_exists($filePath)) {
            return 0;
        }

        $content = file_get_contents($filePath);
        if ($content === false) {
            return 0;
        }

        $data = json_decode($content, true);
        if ($data === null || !isset($data['expires_at']) || $data['expires_at'] === null) {
            return 0;
        }

        $remaining = $data['expires_at'] - time();
        return max(0, $remaining);
    }

    /**
     * Check rate limit with retry info - returns array with allowed status and retry time
     * 
     * @param string $key Unique identifier for the rate limit
     * @param int $maxAttempts Maximum attempts allowed
     * @param int $windowSeconds Time window in seconds
     * @return array ['allowed' => bool, 'retry_after' => int]
     */
    public function attemptWithInfo(string $key, int $maxAttempts = 1, int $windowSeconds = 60): array
    {
        $count = $this->get($key);

        if ($count === null) {
            $this->set($key, 1, $windowSeconds);
            return ['allowed' => true, 'retry_after' => 0];
        }

        if ($count >= $maxAttempts) {
            return ['allowed' => false, 'retry_after' => $this->getTimeRemaining($key)];
        }

        $this->increment($key);
        return ['allowed' => true, 'retry_after' => 0];
    }

    /**
     * Clear all expired entries (cleanup)
     */
    public function cleanup(): void
    {
        $files = glob($this->cacheDir . '/*.json');
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);

            if ($data !== null && isset($data['expires_at']) && $data['expires_at'] !== null) {
                if (time() > $data['expires_at']) {
                    unlink($file);
                }
            }
        }
    }
}
