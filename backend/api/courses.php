<?php
// ================================================
// EduAI — Courses API
// GET    /api/courses.php        — list all courses (with files)
// POST   /api/courses.php        — create a course
// PUT    /api/courses.php?id=N   — update a course
// DELETE /api/courses.php?id=N   — delete a course
// ================================================

require_once __DIR__ . '/../api.php';

$db  = getDB();
$uid = userId();
$id  = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {

    // ---- LIST -------------------------------------------------------
    case 'GET':
        $stmt = $db->prepare('
            SELECT c.*,
                   GROUP_CONCAT(cf.file_name SEPARATOR "||") AS file_names,
                   GROUP_CONCAT(cf.file_size SEPARATOR "||") AS file_sizes
            FROM courses c
            LEFT JOIN course_files cf ON cf.course_id = c.id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
        ');
        $stmt->execute([$uid]);
        $rows = $stmt->fetchAll();

        // Parse files
        foreach ($rows as &$row) {
            $names = $row['file_names'] ? explode('||', $row['file_names']) : [];
            $sizes = $row['file_sizes'] ? explode('||', $row['file_sizes']) : [];
            $row['files'] = array_map(
                fn($n, $s) => ['name' => $n, 'size' => (int)$s],
                $names, $sizes
            );
            unset($row['file_names'], $row['file_sizes']);
            $row['progress'] = (int)$row['progress'];
        }
        unset($row);
        ok($rows);
        break;

    // ---- CREATE -----------------------------------------------------
    case 'POST':
        $b = body();
        if (empty($b['name'])) fail('Course name is required');

        $stmt = $db->prepare('
            INSERT INTO courses (user_id, name, category, description, color, progress)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $uid,
            trim($b['name']),
            $b['category']    ?? 'General',
            $b['description'] ?? '',
            $b['color']       ?? 'var(--gradient-primary)',
            (int)($b['progress'] ?? 0),
        ]);
        $newId = (int)$db->lastInsertId();

        // Insert files if provided
        if (!empty($b['files']) && is_array($b['files'])) {
            $fStmt = $db->prepare('INSERT INTO course_files (course_id, file_name, file_size) VALUES (?,?,?)');
            foreach ($b['files'] as $f) {
                $fStmt->execute([$newId, $f['name'] ?? '', $f['size'] ?? 0]);
            }
        }

        // Return the full new course
        $stmt2 = $db->prepare('SELECT * FROM courses WHERE id = ?');
        $stmt2->execute([$newId]);
        $course = $stmt2->fetch();
        $course['files'] = $b['files'] ?? [];
        $course['progress'] = (int)$course['progress'];
        ok($course, 201);
        break;

    // ---- UPDATE -----------------------------------------------------
    case 'PUT':
        if (!$id) fail('Course ID required');
        $b = body();

        $db->prepare('
            UPDATE courses
            SET name=?, category=?, description=?, color=?, progress=?, updated_at=NOW()
            WHERE id=? AND user_id=?
        ')->execute([
            $b['name']        ?? '',
            $b['category']    ?? 'General',
            $b['description'] ?? '',
            $b['color']       ?? '',
            (int)($b['progress'] ?? 0),
            $id, $uid,
        ]);
        ok(['id' => $id, 'updated' => true]);
        break;

    // ---- DELETE -----------------------------------------------------
    case 'DELETE':
        if (!$id) fail('Course ID required');
        $db->prepare('DELETE FROM courses WHERE id=? AND user_id=?')->execute([$id, $uid]);
        ok(['id' => $id, 'deleted' => true]);
        break;

    default:
        fail('Method not allowed', 405);
}
