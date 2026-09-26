<?php
// ================================================
// EduAI — Summaries API
// GET    /api/summaries.php        — list summaries
// POST   /api/summaries.php        — create summary
// DELETE /api/summaries.php?id=N   — delete summary
// ================================================

require_once __DIR__ . '/../api.php';

$db  = getDB();
$uid = userId();
$id  = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = $db->prepare('
            SELECT id, title, content, original_notes, created_at
            FROM summaries
            WHERE user_id = ?
            ORDER BY created_at DESC
        ');
        $stmt->execute([$uid]);
        ok($stmt->fetchAll());
        break;

    case 'POST':
        $b = body();
        if (empty($b['content'])) fail('Content is required');

        $stmt = $db->prepare('
            INSERT INTO summaries (user_id, title, content, original_notes)
            VALUES (?,?,?,?)
        ');
        $stmt->execute([
            $uid,
            $b['title']          ?? ('Summary — ' . date('Y-m-d')),
            $b['content'],
            $b['original_notes'] ?? '',
        ]);
        $newId = (int)$db->lastInsertId();

        $stmt2 = $db->prepare('SELECT * FROM summaries WHERE id=?');
        $stmt2->execute([$newId]);
        ok($stmt2->fetch(), 201);
        break;

    case 'DELETE':
        if (!$id) fail('Summary ID required');
        $db->prepare('DELETE FROM summaries WHERE id=? AND user_id=?')->execute([$id, $uid]);
        ok(['id' => $id, 'deleted' => true]);
        break;

    default:
        fail('Method not allowed', 405);
}
