# EduAI

EduAI is a student-focused learning workspace built with React and Vite. It combines course and study planning tools with Gemini-powered tutoring, summaries, quizzes, PDF conversations, assignment feedback, and progress tracking.

## Features

- Dashboard with course, quiz, summary, assignment, and plan statistics
- Course management with attached course materials
- AI Tutor for conversational study help
- PDF Chat for asking questions about uploaded documents
- AI-generated quizzes with saved results
- Lecture-note summaries
- Study planner with deadlines and daily study targets
- Assignment evaluation and feedback
- Progress history and performance tracking
- Guest mode with browser local-storage persistence
- Optional PHP/MySQL persistence for registered users
- Gemini model discovery through the `ListModels` API, filtered to models supporting `generateContent`

## Stack

- React 19, Vite, React Router
- Chart.js, React Markdown, and Lucide React
- PHP 8+ with PDO and MySQL 8+
- Google Gemini REST API

## Requirements

- Node.js 18+ and npm
- PHP 8+ with the PDO MySQL extension, when using the backend
- MySQL 8+, when using persistent accounts and data
- A Gemini API key for AI features

## Quick Start

Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

You can use Guest Mode immediately. Guest data is stored in the browser and does not require PHP or MySQL.

## Gemini Configuration

Open **API Key** in the application and enter a Gemini API key. The key is stored in browser local storage under `eduai_gemini_key`.

The application calls Gemini's `ListModels` endpoint and selects a returned model that supports `generateContent`. Lower-cost model names containing `flash-lite` or `lite` are preferred, followed by `flash` models. No model ID needs to be hardcoded in the frontend.

For local development, an optional default key can be supplied through `.env.local`:

```env
VITE_DEFAULT_GEMINI_API_KEY=your-gemini-api-key
```

Vite embeds `VITE_` variables in the browser bundle. Use this only for local or controlled deployments. Do not use a client-side default key for a public production application; proxy Gemini requests through a server and keep the key there.

## PHP/MySQL Backend

The frontend uses the PHP backend for non-guest users and falls back to local storage if the backend is unavailable. The current API base URL is configured in [src/utils/apiClient.js](src/utils/apiClient.js):

```text
http://localhost/AI-Learning-api
```

### 1. Create and select the database

Create a database from your hosting control panel, select it in phpMyAdmin, and import [backend/schema.sql](backend/schema.sql). The schema intentionally does not run `DROP DATABASE`, `CREATE DATABASE`, `USE`, or `CREATE VIEW`, because shared hosting users commonly do not have those privileges.

```bash
mysql -u your_mysql_user -p your_database_name < backend/schema.sql
```

### 2. Configure database access

Update the credentials in [backend/config/database.php](backend/config/database.php):

```php
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'eduai_lms');
define('DB_USER', 'your_mysql_user');
define('DB_PASS', 'your_mysql_password');
```

### 3. Serve the backend

Configure Apache, XAMPP, or another PHP server so the backend is available at `http://localhost/AI-Learning-api`.

The backend allows requests from the Vite development origins `localhost:5173`, `localhost:3000`, and `127.0.0.1:5173`. Update the CORS allowlist in [backend/api.php](backend/api.php) if the frontend runs on another origin.

The backend modules are:

| Module | Responsibility |
| --- | --- |
| `auth.php` | Registration and login |
| `courses.php` | Courses and course files |
| `chat.php` | AI Tutor chat history |
| `summaries.php` | Saved summaries |
| `quiz.php` | Quiz results and statistics |
| `assignments.php` | Assignments and evaluations |
| `plans.php` | Study plans |
| `stats.php` | Dashboard and progress statistics |

## Application Routes

| Route | View |
| --- | --- |
| `/` | Dashboard |
| `/courses` | Courses |
| `/tutor` | AI Tutor |
| `/pdf-chat` | PDF Chat |
| `/quiz` | Quiz |
| `/summaries` | Summaries |
| `/planner` | Study Planner |
| `/progress` | Progress |
| `/assignments` | Assignments |

## Project Structure

```text
src/
	components/       Shared layout and modal components
	pages/            Application views
	utils/            Gemini, API, and storage helpers
	App.jsx           Routes and authentication state
	App.css           Application styles
	index.css         Global styles
backend/
	api/              PHP endpoint modules
	config/            Database configuration
	api.php            CORS and response helpers
	schema.sql         MySQL schema and seed user
public/              Static assets
```

## Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
npm run lint      # Run Oxlint
```

## Troubleshooting

### AI requests fail

Confirm that the API key is valid and can access Gemini models. The app queries `ListModels`; at least one returned model must advertise `generateContent` support.

### The app stays in guest mode

Guest mode is expected when no account is used. To use MySQL persistence, start the PHP server, verify the API base URL in `src/utils/apiClient.js`, and confirm that the database credentials are correct.

### CORS errors

Make sure the frontend origin is included in the allowlist in `backend/api.php` and that the PHP server is running.

## License

No license has been specified for this project yet.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
