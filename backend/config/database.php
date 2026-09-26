<?php
// ================================================
// EduAI — Database Configuration
// ================================================

define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'eduai_lms');
define('DB_USER', 'root');        // Change to your MySQL username
define('DB_PASS', 'password');            // Change to your MySQL password
define('DB_CHARSET', 'utf8mb4');

define('DEFAULT_USER_ID', 1);    // Single-user mode default

/**
 * Get a PDO database connection (singleton pattern).
 */
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed: ' . $e->getMessage(),
            ]);
            exit;
        }
    }
    return $pdo;
}
