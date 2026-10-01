# Gifff

A full-stack application for storing, browsing, and managing GIFs.

The project was built with a focus on clean architecture, automated testing, code quality, and a reproducible development and production environment.

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- Alembic
- Pydantic
- Pytest
- Ruff

### Frontend

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- ESLint
- Sass

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions

## Project Structure

```text
gifff/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── test/
│   │   └── types/
│   ├── eslint.config.js
│   ├── package.json
│   └── vite.config.ts
│
├── .github/
│   └── workflows/
├── compose.yaml
├── compose.dev.yaml
├── compose.prod.yaml
└── dockerfile
```

## Features

- Upload and store GIFs
- Browse GIFs with pagination
- Infinite scrolling
- Sort GIFs
- Delete GIFs
- PostgreSQL persistence
- Async database access
- Database migrations with Alembic
- REST API built with FastAPI
- Responsive React frontend

## Running the Project

Clone the repository:

```bash
git clone https://github.com/ghbamorim/gifff.git
cd gifff
```

### Database

Start PostgreSQL for development:

```bash
docker compose \
  -f compose.yaml \
  -f compose.dev.yaml \
  up -d
```

### Backend

Create and activate a virtual environment.

Windows:

```bash
cd backend

python -m venv .venv
.venv\Scripts\activate
```

Linux/macOS:

```bash
cd backend

python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI interactive documentation:

```text
http://localhost:8000/docs
```

Health check:

```text
GET /health
```

### Frontend

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The development server will be available at:

```text
http://localhost:5173
```

## Tests

### Backend

```bash
cd backend
pytest
```

The backend test suite uses Pytest and enforces code coverage through the configuration in `pyproject.toml`.

### Frontend

Run the test suite once:

```bash
cd frontend
npm run test:run
```

Run tests in watch mode:

```bash
npm test
```

Generate coverage:

```bash
npm run test:coverage
```

## Code Quality

### Backend

The backend uses Ruff for static analysis and linting.

```bash
cd backend
ruff check .
```

### Frontend

The frontend uses ESLint.

```bash
cd frontend
npm run lint
```

TypeScript is also checked as part of the production build:

```bash
npm run build
```

## Continuous Integration

GitHub Actions automatically validates pull requests targeting `main`.

The CI pipeline runs:

- Backend lint with Ruff
- Backend tests with Pytest
- Frontend lint with ESLint
- Frontend tests with Vitest

This prevents code that fails the automated quality checks from being merged unnoticed.

## Production

The application includes a multi-stage Docker build.

The frontend is compiled with Node and copied into the final Python image, allowing the FastAPI application to serve the production frontend and API from a single container.

The production environment can be started with:

```bash
docker compose \
  --env-file .env.prod \
  -f compose.yaml \
  -f compose.prod.yaml \
  up --build -d
```

Database migrations are automatically applied before the application starts.

## License

This project is licensed under the MIT License.
