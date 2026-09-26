<?php
// ================================================
// EduAI — Dashboard Stats API
// GET /api/stats.php  — aggregated dashboard data
// ================================================

require_once __DIR__ . '/../api.php';

requireMethod('GET');

$db  = getDB();
$uid = userId();

// Get all stats in one query via the view
$stmt = $db->prepare('SELECT * FROM dashboard_stats WHERE user_id = ?');
$stmt->execute([$uid]);
$stats = $stmt->fetch();

// Recent activity (last 5 quiz results + 5 summaries)
$quizStmt = $db->prepare('
    SELECT topic, score, created_at FROM quiz_results
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
');
$quizStmt->execute([$uid]);
$recentQuizzes = $quizStmt->fetchAll();

$sumStmt = $db->prepare('
    SELECT title, created_at FROM summaries
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
');
$sumStmt->execute([$uid]);
$recentSummaries = $sumStmt->fetchAll();

// Score trend (last 10 quiz scores)
$trendStmt = $db->prepare('
    SELECT score, topic, created_at
    FROM quiz_results
    WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 10
');
$trendStmt->execute([$uid]);
$scoreTrend = array_reverse($trendStmt->fetchAll());

ok([
    'stats'           => $stats,
    'recent_quizzes'  => $recentQuizzes,
    'recent_summaries'=> $recentSummaries,
    'score_trend'     => $scoreTrend,
]);
