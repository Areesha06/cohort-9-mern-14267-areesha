# cohort-9-mern-14267-areesha
Cohort 9 — MERN (NodeJS+ReactJS) assignment for Areesha Kashif

# AniNotes

**Your thoughts, adorably organized.**

AniNotes is a full-stack MERN notes application built as an internship project. It supports secure user authentication, rich-text note-taking, real-time sync across devices, search, export/import, and a cute, custom-designed UI: all backed by a fully tested and CI-integrated codebase.

## Features:

### Core
- **Authentication** — sign up, log in, log out with JWT-based sessions and bcrypt password hashing
- **User-specific notes** — every note is private to its owner, enforced at the database query level
- **Notes CRUD** — create, edit, and delete notes
- **Rich text editor** — bold, italic, underline, strikethrough, lists, and blockquotes (via Quill)
- **Dashboard** — a clean, card-based view of all your notes
- **Global error handling** — centralized, consistent error responses across the whole API
- **Structured logging** — every request, error, and key event logged with Pino
- **Fully tested** — Mocha/Chai on the backend, Jest/React Testing Library on the frontend
- **Continuous Integration** — SonarCloud code quality analysis via GitHub Actions

### Extra features
-  **Search & filter** — instantly filter notes by title or content
-  **User profile** — view your account details, notes count, and member-since date
-  **Export / Import** — export selected notes as individual `.txt` files, or import multiple `.txt` files at once as separate notes
- **Real-time sync** — notes update live across open tabs/devices via Socket.IO, scoped privately per user

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- Pino (structured logging)
- Socket.IO (real-time updates)
- Mocha + Chai + Sinon + Supertest (testing)
- mongodb-memory-server (isolated test database)

**Frontend**
- React + React Router
- Axios
- Socket.IO client
- React Quill (rich text editor)
- Jest + React Testing Library (testing)

**Tooling**
- SonarCloud (code quality & coverage)
- GitHub Actions (CI)
- Git feature-branch workflow


## Project Structure

```
aninotes/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, Socket.IO setup
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── models/          # Mongoose schemas (User, Note)
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Logger, AppError, helpers
│   │   ├── validators/      # express-validator rules
│   │   └── app.js
│   ├── tests/
│   │   ├── unit/            # Isolated logic tests (mocked DB)
│   │   └── integration/     # Real HTTP requests via Supertest
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── api/              # Axios request functions
│       ├── components/       # Reusable UI (auth, notes, profile, common)
│       ├── context/           # AuthContext, ToastContext
│       ├── hooks/             # useDebounce, useSocketStatus
│       ├── pages/             # Route-level pages
│       ├── routes/            # ProtectedRoute
│       ├── socket/            # Socket.IO client
│       ├── styles/            # Design tokens & global styles
│       └── utils/             # Formatters, import/export helpers
│
├── .github/workflows/         # CI (SonarCloud analysis)
└── sonar-project.properties
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS version)
- A MongoDB database — either local or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone the repo

```bash
git clone <your-fork-url>
cd aninotes
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `.env.example` for the full list):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
LOG_LEVEL=info
NODE_ENV=development
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
```

Run the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Run the frontend:

```bash
npm start
```

The app will open at `http://localhost:3000`.

> Both the backend and frontend need to be running at the same time, in separate terminals.


## Testing

### Backend (Mocha + Chai)

```bash
cd backend
npm test                 # run the full suite
npm run test:coverage    # run with coverage report (used by SonarCloud)
```

Covers: auth (registration, login, JWT), the `protect` middleware, notes CRUD, ownership enforcement, search, validation, and global error handling — using both isolated unit tests (mocked database) and full integration tests (real HTTP requests against an in-memory MongoDB instance).

### Frontend (Jest + React Testing Library)

```bash
cd frontend
npm test -- --watchAll=false   # run the full suite
npm run test:coverage          # run with coverage report
```

Covers: auth pages, protected routing, the dashboard (loading/empty/error/search/delete states), the note editor (create/edit/validation), export/import, and real-time socket updates.



## Code Quality

This project is analyzed by **SonarCloud** on every push, via GitHub Actions (`.github/workflows/sonarcloud.yml`). The workflow installs dependencies, runs both test suites with coverage, and submits the results for analysis, covering bugs, vulnerabilities, code smells, and test coverage across both the backend and frontend.


## API Overview

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new account | No |
| POST | `/api/auth/login` | Log in, receive a JWT | No |
| GET | `/api/auth/me` | Get the current authenticated user | Yes |
| GET | `/api/notes` | Get all of your notes (`?search=` optional) | Yes |
| POST | `/api/notes` | Create a note | Yes |
| GET | `/api/notes/:id` | Get a single note | Yes |
| PUT | `/api/notes/:id` | Update a note | Yes |
| DELETE | `/api/notes/:id` | Delete a note | Yes |

All `/api/notes` routes require a valid `Authorization: Bearer <token>` header and only ever operate on notes owned by the requesting user.

### Real-time events (Socket.IO)

The client connects with its JWT in the socket handshake and joins a private room scoped to its user ID. The server emits:

- `note:created`
- `note:updated`
- `note:deleted`

...whenever the corresponding action happens, so other open sessions for the same account can refresh automatically.
