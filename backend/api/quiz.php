<?php
// ================================================
// EduAI — Quiz Results API
// GET    /api/quiz.php       — list results (+ stats)
// POST   /api/quiz.php       — save a result
// DELETE /api/quiz.php?id=N  — delete a result
// ================================================

require_once __DIR__ . '/../api.php';

$db  = getDB();
$uid = userId();
$id  = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // Results list
        $stmt = $db->prepare('
            SELECT id, topic, difficulty, score, correct, total, created_at
            FROM quiz_results
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 200
        ');
        $stmt->execute([$uid]);
        $results = $stmt->fetchAll();

        // Stats aggregate
        $sStmt = $db->prepare('
            SELECT
                COUNT(*)                        AS total_quizzes,
                ROUND(AVG(score), 1)            AS avg_score,
                MAX(score)                      AS best_score,
                SUM(score >= 60)                AS passed,
                COUNT(DISTINCT topic)           AS topics_covered
            FROM quiz_results WHERE user_id = ?
        ');
        $sStmt->execute([$uid]);
        $stats = $sStmt->fetch();

        // Cast types
        foreach ($results as &$r) {
            $r['score']   = (int)$r['score'];
            $r['correct'] = (int)$r['correct'];
            $r['total']   = (int)$r['total'];
        }
        unset($r);

        ok(['results' => $results, 'stats' => $stats]);
        break;

    case 'POST':
        $b = body();
        if (!isset($b['score'])) fail('Score is required');

        $stmt = $db->prepare('
            INSERT INTO quiz_results (user_id, topic, difficulty, score, correct, total)
            VALUES (?,?,?,?,?,?)
        ');
        $stmt->execute([
            $uid,
            $b['topic']      ?? 'General',
            $b['difficulty'] ?? 'Medium',
            (int)$b['score'],
            (int)($b['correct'] ?? 0),
            (int)($b['total']   ?? 0),
        ]);
        ok(['id' => (int)$db->lastInsertId()], 201);
        break;

    case 'DELETE':
        if (!$id) fail('Result ID required');
        $db->prepare('DELETE FROM quiz_results WHERE id=? AND user_id=?')->execute([$id, $uid]);
        ok(['id' => $id, 'deleted' => true]);
        break;

    default:
        fail('Method not allowed', 405);
}
