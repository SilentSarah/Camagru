# RateLimiter

A simple, file-based rate limiter with key-value storage and TTL (Time To Live) support for the Camagru application.

## Overview

The `RateLimiter` class provides a lightweight caching and rate limiting solution using the file system. It stores data in JSON files in the system's temp directory, making it suitable for single-server deployments without external dependencies like Redis.

## Location

```
src/backend/Core/RateLimiter.php
```

## Usage

### Getting the Instance

The RateLimiter uses the Singleton pattern:

```php
require_once __DIR__ . "/Core/RateLimiter.php";

$rateLimiter = RateLimiter::getInstance();
```

---

## API Reference

### `set(string $key, mixed $value, ?int $ttl = null): bool`

Store a value with an optional TTL.

**Parameters:**

- `$key` - Unique identifier for the stored value
- `$value` - The value to store (can be any JSON-serializable type)
- `$ttl` - Time to live in seconds (null = no expiration)

**Returns:** `true` on success, `false` on failure

**Example:**

```php
// Store a value that expires in 1 hour
$rateLimiter->set('user:123:session', ['logged_in' => true], 3600);

// Store a value that never expires
$rateLimiter->set('app:config', ['debug' => false], null);
```

---

### `get(string $key): mixed`

Retrieve a value by key. Returns `null` if the key doesn't exist or has expired.

**Parameters:**

- `$key` - The key to retrieve

**Returns:** The stored value or `null`

**Example:**

```php
$session = $rateLimiter->get('user:123:session');
if ($session !== null) {
    echo "User is logged in";
}
```

---

### `has(string $key): bool`

Check if a key exists and is not expired.

**Parameters:**

- `$key` - The key to check

**Returns:** `true` if exists and not expired, `false` otherwise

**Example:**

```php
if ($rateLimiter->has('user:123:session')) {
    // Session is valid
}
```

---

### `delete(string $key): bool`

Delete a key from the cache.

**Parameters:**

- `$key` - The key to delete

**Returns:** `true` on success

**Example:**

```php
$rateLimiter->delete('user:123:session');
```

---

### `increment(string $key, int $amount = 1, ?int $ttl = null): int`

Increment a counter. Creates the key with value `$amount` if it doesn't exist.

**Parameters:**

- `$key` - The key to increment
- `$amount` - Amount to increment by (default: 1)
- `$ttl` - TTL for new keys (ignored if key already exists)

**Returns:** The new value after incrementing

**Example:**

```php
// Track page views (expires after 24 hours)
$views = $rateLimiter->increment('page:home:views', 1, 86400);
echo "Page has been viewed $views times";

// Increment by custom amount
$rateLimiter->increment('user:123:points', 10);
```

---

### `attempt(string $key, int $maxAttempts = 1, int $windowSeconds = 60): bool`

**This is the primary rate limiting method.**

Check if an action is allowed based on rate limiting rules. Automatically tracks attempts and enforces limits.

**Parameters:**

- `$key` - Unique identifier for the rate limit (e.g., `"login:192.168.1.1"`)
- `$maxAttempts` - Maximum attempts allowed in the time window
- `$windowSeconds` - Time window in seconds

**Returns:** `true` if action is allowed, `false` if rate limited

**Example:**

```php
// Allow 5 login attempts per minute per IP
$key = "login:" . $_SERVER['REMOTE_ADDR'];
if (!$rateLimiter->attempt($key, 5, 60)) {
    http_response_code(429);
    die("Too many login attempts. Please wait.");
}

// Allow 1 notification email per post per 5 minutes
$key = "notification:like:{$userId}:{$photoId}";
if (!$rateLimiter->attempt($key, 1, 300)) {
    return; // Skip sending email
}
```

---

### `cleanup(): void`

Remove all expired entries from the cache. Call this periodically (e.g., via cron job) to prevent disk space buildup.

**Example:**

```php
$rateLimiter->cleanup();
```

---

## Common Use Cases

### 1. API Rate Limiting

```php
// 100 requests per minute per user
$key = "api:user:{$userId}";
if (!$rateLimiter->attempt($key, 100, 60)) {
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded']);
    exit;
}
```

### 2. Login Attempt Protection

```php
$ip = $_SERVER['REMOTE_ADDR'];
$key = "login:attempts:{$ip}";

if (!$rateLimiter->attempt($key, 5, 300)) {
    // Block for 5 minutes after 5 failed attempts
    $response = new HttpResponse(429, "Too Many Requests", [
        "error" => "Too many login attempts. Please try again in 5 minutes."
    ]);
    $response->sendJson();
    return;
}
```

### 3. Email Notification Throttling

```php
// 1 email per post per 5 minutes
$key = "notification:comment:{$postOwnerId}:{$photoId}";
if (!$rateLimiter->attempt($key, 1, 300)) {
    return; // Don't send duplicate emails
}
sendNotificationEmail($postOwner, $commenter);
```

### 4. Feature Flags / Temporary Storage

```php
// Store a verification code for 10 minutes
$rateLimiter->set("verify:{$userId}", $code, 600);

// Later, verify the code
$storedCode = $rateLimiter->get("verify:{$userId}");
if ($storedCode === $userInput) {
    $rateLimiter->delete("verify:{$userId}");
    echo "Verified!";
}
```

### 5. Tracking / Analytics

```php
// Count daily active users
$today = date('Y-m-d');
$rateLimiter->increment("stats:dau:{$today}", 1, 86400);

// Get count
$activeUsers = $rateLimiter->get("stats:dau:{$today}") ?? 0;
```

---

## Storage Details

- **Location:** `{sys_get_temp_dir()}/camagru_ratelimit/`
- **Format:** JSON files with MD5-hashed keys as filenames
- **Structure:**
  ```json
  {
    "value": "stored_value",
    "created_at": 1704394800,
    "expires_at": 1704398400
  }
  ```

---

## Limitations

- **Single server only:** File-based storage doesn't work across multiple servers
- **Not atomic:** Concurrent requests might cause race conditions in high-traffic scenarios
- **Disk I/O:** Each operation reads/writes to disk (slower than Redis/Memcached)

For production with multiple servers or high traffic, consider migrating to Redis.

---

## Best Practices

1. **Use descriptive keys:** `"login:ip:192.168.1.1"` is better than `"l1"`
2. **Namespace keys:** Use prefixes like `notification:`, `api:`, `auth:`
3. **Set reasonable TTLs:** Don't let cache files accumulate indefinitely
4. **Call `cleanup()` periodically:** Add to a cron job to remove expired entries
5. **Handle rate limits gracefully:** Return proper 429 status codes with retry headers
