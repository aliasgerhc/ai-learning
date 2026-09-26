<?php
// ================================================
// EduAI — Assignments API
// GET    /api/assignments.php        — list
// POST   /api/assignments.php        — create
// DELETE /api/assignments.php?id=N   — delete
// ================================================

require_once __DIR__ . '/../api.php';

$db  = getDB();
$uid = userId();
$id  = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = $db->prepare('
            SELECT id, title, subject, criteria, content, feedback, created_at
            FROM assignments
            WHERE user_id = ?
            ORDER BY created_at DESC
        ');
        $stmt->execute([$uid]);
        ok($stmt->fetchAll());
        break;

    case 'POST':
        $b = body();
        if (empty($b['content'])) fail('Assignment content is required');

        $stmt = $db->prepare('
            INSERT INTO assignments (user_id, title, subject, criteria, content, feedback)
            VALUES (?,?,?,?,?,?)
        ');
        $stmt->execute([
            $uid,
            $b['title']    ?? 'Untitled',
            $b['subject']  ?? 'General',
            $b['criteria'] ?? '',
            $b['content'],
            $b['feedback'] ?? '',
        ]);
        $newId = (int)$db->lastInsertId();

        $stmt2 = $db->prepare('SELECT * FROM assignments WHERE id=?');
        $stmt2->execute([$newId]);
        ok($stmt2->fetch(), 201);
        break;

    case 'DELETE':
        if (!$id) fail('Assignment ID required');
        $db->prepare('DELETE FROM assignments WHERE id=? AND user_id=?')->execute([$id, $uid]);
        ok(['id' => $id, 'deleted' => true]);
        break;

    default:
        fail('Method not allowed', 405);
}
