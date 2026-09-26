<?php
// ================================================
// EduAI — API Base / CORS / Helper Functions
// ================================================

require_once __DIR__ . '/config/database.php';

// ------------------------------------------------
// CORS — allow React dev server to call the API
// ------------------------------------------------
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Respond to CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ------------------------------------------------
// Helper Functions
// ------------------------------------------------

/**
 * Send a JSON success response.
 */
function ok(mixed $data = null, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send a JSON error response.
 */
function fail(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Get the JSON request body as an associative array.
 */
function body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/**
 * Require a specific HTTP method or fail with 405.
 */
function requireMethod(string ...$methods): void {
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods, true)) {
        fail('Method not allowed', 405);
    }
}

/**
 * Get user_id from query string (defaults to 1 in single-user mode).
 */
function userId(): int {
    return (int) ($_GET['user_id'] ?? DEFAULT_USER_ID);
}
