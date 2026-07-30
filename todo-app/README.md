# To-Do List App

A clean, full-stack **To-Do List** application built with a vanilla JS frontend and a Node.js + Express REST API backend. Works standalone in the browser (localStorage) or fully connected when served via Express.

---

## Features

- ✅ Add, complete, and delete tasks
- 🔍 Filter by **All / Active / Completed**
- 🧹 Clear all completed tasks at once
- 🔢 Live counter of remaining tasks
- 💾 Persistent via **localStorage** (standalone) or REST API (served mode)
- 📱 Fully responsive, accessible UI
- 🐳 Docker + Docker Compose ready
- 🔄 GitHub Actions CI/CD pipeline

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript ES6+ |
| Backend   | Node.js 20, Express 4               |
| Security  | Helmet, CORS                        |
| Logging   | Morgan                              |
| Testing   | Jest, Supertest                     |
| DevOps    | Docker, Docker Compose, GitHub Actions |

---

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start with auto-reload
npm run dev

# Run tests
npm test
```

The server will start on **http://localhost:3000**.

### Docker

```bash
# Build and start
docker-compose up --build

# Stop
docker-compose down
```

The app will be available at **http://localhost:3000**.

---

## API Reference

| Method   | Endpoint          | Description                    | Body                        |
|----------|-------------------|--------------------------------|-----------------------------|
| `GET`    | `/health`         | Health check                   | —                           |
| `GET`    | `/api/tasks`      | List all tasks                 | —                           |
| `POST`   | `/api/tasks`      | Create a new task              | `{ "text": "..." }`         |
| `PUT`    | `/api/tasks/:id`  | Update a task                  | `{ "text"?, "completed"? }` |
| `DELETE` | `/api/tasks/:id`  | Delete a specific task         | —                           |
| `DELETE` | `/api/tasks`      | Clear all completed tasks      | —                           |

### Example

```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Buy groceries"}'

# Mark as completed
curl -X PUT http://localhost:3000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete
curl -X DELETE http://localhost:3000/api/tasks/<id>
```

---

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable    | Default       | Description                   |
|-------------|---------------|-------------------------------|
| `PORT`      | `3000`        | Port the server listens on    |
| `NODE_ENV`  | `development` | Runtime environment           |

```bash
cp .env.example .env
```

---

## Project Structure

```
todo-app/
├── __tests__/
│   └── server.test.js    # Jest + Supertest API tests
├── index.html            # Frontend HTML
├── style.css             # Responsive styles
├── app.js                # Frontend logic (localStorage + API)
├── server.js             # Express REST API
├── package.json          # Project metadata & scripts
├── package-lock.json     # Dependency lock file
├── .env.example          # Environment variable template
├── Dockerfile            # Container image definition
├── docker-compose.yml    # Multi-service orchestration
└── README.md             # This file
```

---

## Running Tests

```bash
npm test
# or with coverage report
npm test -- --coverage
```

---

## License

MIT
