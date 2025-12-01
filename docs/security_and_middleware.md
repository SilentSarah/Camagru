# Security and Middleware Guide

This guide explains the core security mechanisms and middleware architecture used in the Camagru microframework.

## 1. Middleware Architecture

The middleware serves as the gatekeeper for your application. It intercepts every incoming request before it reaches the controller actions. This allows for centralized handling of cross-cutting concerns like authentication, logging, and security checks.

### How it Works

The `Middleware::handle($controller, $action, $method)` method is the entry point.

1.  **Routing Check**: It first verifies if the requested controller and action exist.
2.  **Method Validation**: It checks if the HTTP method (GET, POST, etc.) is allowed for the requested route.
3.  **Security Checks**: It runs security protocols like CORS and CSRF verification.
4.  **Dispatch**: Finally, if all checks pass, it instantiates the controller and calls the action.

## 2. CORS (Cross-Origin Resource Sharing)

CORS is a security feature that restricts web pages from making requests to a different domain than the one that served the web page.

### Implementation

In this framework, CORS is handled by the `Cors.php` helper.

- **Headers**: The `cors()` function sets headers like `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`.
- **Preflight Requests**: It automatically handles `OPTIONS` requests (preflight checks) by sending a 200 OK response and exiting, allowing the browser to proceed with the actual request.

## 3. CSRF (Cross-Site Request Forgery)

CSRF is an attack that forces an end user to execute unwanted actions on a web application in which they're currently authenticated.

### Implementation Strategy (Synchronizer Token Pattern)

1.  **Token Generation**: A unique, random token is generated and stored in the user's session (`$_SESSION['csrf_token']`).
2.  **Token Exposure**: An endpoint (e.g., `/csrf`) exposes this token to the frontend so it can be included in requests.
3.  **Verification**:
    - For state-changing requests (POST, PUT, DELETE, PATCH), the middleware intercepts the request.
    - It looks for the token in the `X-CSRF-TOKEN` header or `csrf_token` body field.
    - It compares this token with the one stored in the session.
    - If they do not match, the request is rejected with a `403 Forbidden` status.

## 4. JWT (JSON Web Tokens)

JWT is used for stateless authentication. Instead of storing session data on the server for every request, the server signs a token that the client holds.

### Structure

A JWT consists of three parts:

1.  **Header**: Specifies the algorithm (e.g., HS256) and token type.
2.  **Payload**: Contains the claims (user data like ID, username, expiration time).
3.  **Signature**: A hash of the header and payload signed with a secret key (`JWT_SECRET`).

### Usage

- **Generation**: When a user logs in, `generate_jwt_token()` creates a signed token containing their user ID.
- **Storage**: The frontend stores this token (usually in `localStorage` or a cookie).
- **Verification**: On subsequent requests, the frontend sends the token (typically in the `Authorization` header). The backend uses `verify_jwt_token()` to ensure the signature is valid and the token hasn't been tampered with.
