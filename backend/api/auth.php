<?php
// ================================================
// EduAI — Auth API
// POST /api/auth.php?action=login
// POST /api/auth.php?action=register
// ================================================

require_once __DIR__ . '/../api.php';

$db = getDB();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed', 405);
}

$b = body();

if ($action === 'login') {
    if (empty($b['email']) || empty($b['password'])) {
        fail('Email and password are required');
    }

    $stmt = $db->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
    $stmt->execute([$b['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($b['password'], $user['password'])) {
        fail('Invalid email or password');
    }

    ok([
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email']
    ]);
} elseif ($action === 'register') {
    if (empty($b['name']) || empty($b['email']) || empty($b['password'])) {
        fail('Name, email, and password are required');
    }

    // Check if email exists
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$b['email']]);
    if ($stmt->fetch()) {
        fail('Email is already registered');
    }

    $hash = password_hash($b['password'], PASSWORD_DEFAULT);
    $stmt = $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$b['name'], $b['email'], $hash, 'student']);
    
    $newId = (int)$db->lastInsertId();

    ok([
        'id' => $newId,
        'name' => $b['name'],
        'email' => $b['email']
    ], 201);
} else {
    fail('Invalid action');
}
