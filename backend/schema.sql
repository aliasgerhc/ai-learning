-- ================================================
-- EduAI Learning Management System
-- MySQL Database Schema
-- ================================================
-- Select your target database in phpMyAdmin before importing this file.
-- Database creation and deletion are intentionally omitted for shared hosting.


-- ------------------------------------------------
-- USERS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL DEFAULT 'Student',
    email       VARCHAR(150) UNIQUE,
    password    VARCHAR(255),
    role        ENUM('student','admin') DEFAULT 'student',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO users (id, name, email, role) VALUES (1, 'Student', 'student@eduai.com', 'student');

-- ------------------------------------------------
-- COURSES
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL DEFAULT 1,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(100) NOT NULL DEFAULT 'General',
    description TEXT,
    color       VARCHAR(200) DEFAULT 'var(--gradient-primary)',
    progress    INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- ------------------------------------------------
-- COURSE FILES (materials attached to a course)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS course_files (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    course_id   INT NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_size   BIGINT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id)
) ENGINE=InnoDB;

-- ------------------------------------------------
-- CHAT HISTORY (AI Tutor conversations)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL DEFAULT 1,
    role        ENUM('user','ai') NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_chat (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------
-- SUMMARIES (Lecture note summaries)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS summaries (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL DEFAULT 1,
    title           VARCHAR(255) NOT NULL,
    original_notes  MEDIUMTEXT,
    content         MEDIUMTEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_summary (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------
-- QUIZ RESULTS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_results (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL DEFAULT 1,
    topic       VARCHAR(200),
    difficulty  ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
    score       INT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    correct     INT DEFAULT 0,
    total       INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_quiz (user_id),
    INDEX idx_topic (topic),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------
-- ASSIGNMENTS & EVALUATIONS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL DEFAULT 1,
    title       VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    subject     VARCHAR(100) NOT NULL DEFAULT 'General',
    criteria    TEXT,
    content     MEDIUMTEXT NOT NULL,
    feedback    MEDIUMTEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_assign (user_id),
    INDEX idx_subject (subject)
) ENGINE=InnoDB;

-- ------------------------------------------------
-- STUDY PLANS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS study_plans (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL DEFAULT 1,
    title       VARCHAR(255) NOT NULL,
    subjects    TEXT,
    deadline    DATE,
    hours_per_day DECIMAL(4,1) DEFAULT 3.0,
    goal        TEXT,
    content     MEDIUMTEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_plan (user_id),
    INDEX idx_deadline (deadline)
) ENGINE=InnoDB;

