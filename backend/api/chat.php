<?php
// ================================================
// EduAI — Chat Messages API
// GET    /api/chat.php           — get chat history
// POST   /api/chat.php           — add a message
// DELETE /api/chat.php           — clear all chat history
// ================================================

require_once __DIR__ . '/../api.php';

$db  = getDB();
$uid = userId();

switch ($_SERVER['REQUEST_METHOD']) {

    // ---- GET HISTORY -----------------------------------------------
    case 'GET':
        $limit = (int)($_GET['limit'] ?? 100);
        $stmt  = $db->prepare('
            SELECT id, role, content, created_at
            FROM chat_messages
            WHERE user_id = ?
            ORDER BY created_at ASC
            LIMIT ?
        ');
        $stmt->execute([$uid, $limit]);
        ok($stmt->fetchAll());
        break;

    // ---- ADD MESSAGE -----------------------------------------------
    case 'POST':
        $b = body();
        if (empty($b['role']))    fail('Role is required (user|ai)');
        if (empty($b['content'])) fail('Content is required');
        if (!in_array($b['role'], ['user','ai'], true)) fail('Role must be user or ai');

        $stmt = $db->prepare('
            INSERT INTO chat_messages (user_id, role, content) VALUES (?,?,?)
        ');
        $stmt->execute([$uid, $b['role'], $b['content']]);
        ok(['id' => (int)$db->lastInsertId()], 201);
        break;

    // ---- CLEAR ALL -------------------------------------------------
    case 'DELETE':
        $db->prepare('DELETE FROM chat_messages WHERE user_id = ?')->execute([$uid]);
        ok(['cleared' => true]);
        break;

    default:
        fail('Method not allowed', 405);
}
