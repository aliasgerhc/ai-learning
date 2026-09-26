<?php
// ================================================
// EduAI — Study Plans API
// GET    /api/plans.php        — list plans
// POST   /api/plans.php        — create plan
// DELETE /api/plans.php?id=N   — delete plan
// ================================================

require_once __DIR__ . '/../api.php';

$db  = getDB();
$uid = userId();
$id  = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = $db->prepare('
            SELECT id, title, subjects, deadline, hours_per_day, goal, content, created_at
            FROM study_plans
            WHERE user_id = ?
            ORDER BY created_at DESC
        ');
        $stmt->execute([$uid]);
        ok($stmt->fetchAll());
        break;

    case 'POST':
        $b = body();
        if (empty($b['content'])) fail('Plan content is required');

        $stmt = $db->prepare('
            INSERT INTO study_plans (user_id, title, subjects, deadline, hours_per_day, goal, content)
            VALUES (?,?,?,?,?,?,?)
        ');
        $stmt->execute([
            $uid,
            $b['title']         ?? 'Study Plan',
            $b['subjects']      ?? '',
            !empty($b['deadline']) ? $b['deadline'] : null,
            (float)($b['hours_per_day'] ?? 3),
            $b['goal']          ?? '',
            $b['content'],
        ]);
        $newId = (int)$db->lastInsertId();

        $stmt2 = $db->prepare('SELECT * FROM study_plans WHERE id=?');
        $stmt2->execute([$newId]);
        ok($stmt2->fetch(), 201);
        break;

    case 'DELETE':
        if (!$id) fail('Plan ID required');
        $db->prepare('DELETE FROM study_plans WHERE id=? AND user_id=?')->execute([$id, $uid]);
        ok(['id' => $id, 'deleted' => true]);
        break;

    default:
        fail('Method not allowed', 405);
}
