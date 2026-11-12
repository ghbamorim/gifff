# Gifff

A private, full-stack application for uploading, browsing, and managing GIFs and other media files. The backend stores both media metadata and binary content in PostgreSQL.

## Stack

| Layer | Technologies |
| --- | --- |
| API | Python 3.14, FastAPI, SQLAlchemy async, asyncpg, Pydantic, Alembic |
| Authentication | JWT sessions in HTTP-only cookies, Argon2 password hashing |
| Frontend | React, TypeScript, Vite, Sass |
| Database | PostgreSQL 17 (local Docker), Amazon RDS (AWS) |
| Tests | Pytest, pytest-cov, Ruff, Vitest, Testing Library, ESLint |
| Infrastructure | Terraform, VPC, ALB, ACM, EC2, RDS, ECR, SSM, Secrets Manager, GitHub Actions |
| Observability | Datadog APM, container logs, SQLAlchemy pool monitoring |

## Features

- Sign in and out with email and password; protected API endpoints.
- Upload multiple files (20 MiB total limit per API request).
- Browse media with pagination, sorting, and infinite scrolling.
- Serve stored media, including response ETag handling, and delete items.
- Authenticated user-management API.
- Async database operations, Alembic migrations, and a `GET /health` endpoint.
- Automated linting and tests, release-triggered deployment, and runtime monitoring.

The application is intended for private use. Only store content you have the right to use.

## Repository structure

```text
backend/               FastAPI application, Alembic migrations, tests
  app/api/routers/     Authentication, GIF/media and user endpoints
  app/core/            Database, settings, auth, pool monitor
  app/models/          SQLAlchemy models
  app/schemas/         Request and response schemas
  app/services/        Business logic
  app/seed.py          AWS-specific initial-user bootstrap
frontend/              React and TypeScript application and tests
infra/                 Terraform-managed AWS infrastructure
  bootstrap/          Terraform state and IAM bootstrap
  alb.tf              HTTPS listener, HTTP redirect and target group
  network.tf          VPC, public/private subnets and routing
  security.tf         ALB, EC2 and RDS security groups
deploy/                AWS production Compose and SSM deployment script
.github/workflows/     Pull request checks and release deployment
Dockerfile             Multi-stage Node/Python container build
compose.yaml           Shared local PostgreSQL service
compose.dev.yaml       Development database port and volume
```

## Local development

**Requirements:** Python 3.14, Node.js (CI uses Node 24), npm, Docker and Docker Compose.

Clone:

```bash
git clone https://github.com/ghbamorim/gifff.git
cd gifff
```

### Environment variables

Create `backend/.env` (not committed) with the backend configuration:

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me
POSTGRES_DB=app_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
JWT_SECRET_KEY=replace-with-a-long-random-secret
AUTH_COOKIE_SECURE=false
```

Docker Compose also reads database variables from the shell or a **root-level** `.env` file. Supply the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and `POSTGRES_PORT` there. Never commit real secrets.

Start PostgreSQL from the repository root:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d
```

Start the API:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API: <http://localhost:8000> · OpenAPI: <http://localhost:8000/docs> · Health: <http://localhost:8000/health>.

Start the frontend in another terminal:

```bash
cd frontend
cp .env.development.example .env.development
npm ci
npm run dev
```

Set `VITE_API_URL=http://localhost:8000` in `frontend/.env.development` (the example currently points to port 8001). Frontend: <http://localhost:5173>.

**First user:** The app requires an existing account to sign in. `backend/app/seed.py` reads its initial password from AWS Secrets Manager and is **not** a generic local seeding command.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/auth/session` | Login and create cookie session |
| GET | `/auth/session` | Current authenticated user |
| DELETE | `/auth/session` | Logout |
| GET | `/gifs` | List with `page`, `page_size`, `sort_order` |
| POST | `/gifs` | Upload files |
| GET | `/gifs/{gif_id}` | Retrieve media bytes |
| DELETE | `/gifs/{gif_id}` | Delete media |
| GET/POST | `/users` | List/create users |
| GET/PUT/PATCH/DELETE | `/users/{user_id}` | Read/update/delete user |

Media and user endpoints require authentication. The media list allows page sizes of 1–100 and sorting by `asc` or `desc`.

## Tests and lint

Backend, from `backend/`:

```bash
pytest
ruff check .
```

Frontend, from `frontend/`:

```bash
npm run test:run
npm run test:coverage
npm run lint
npm run build
```

The repository configures **100% coverage thresholds** for measured backend/frontend code; selected backend files are excluded from measurement. `.github/workflows/tests.yaml` runs lint, tests and a frontend build for pull requests to `main`.

## Deployment

### Infrastructure as code

The `infra/` directory defines the AWS environment using Terraform. The `infra/bootstrap/` directory contains separate bootstrap resources for Terraform state and IAM. The main configuration includes:

- A VPC with two private subnets for RDS and two public subnets for the internet-facing Application Load Balancer (ALB).
- An EC2 `t3.micro` instance in a public subnet, with inbound HTTP traffic restricted by its security group to the ALB.
- A private PostgreSQL 17 RDS instance (`db.t4g.micro`) with encrypted storage, managed master password, backups and deletion protection.
- An ALB HTTP listener redirecting port 80 to HTTPS on port 443; the HTTPS listener uses an ACM certificate supplied through `acm_certificate_arn`.
- IAM permissions, GitHub Actions OIDC integration, ECR, Secrets Manager access and Datadog-related permissions.

Terraform configuration describes the intended infrastructure; it does not by itself confirm that all resources have been applied. Configure the AWS providers, credentials, remote state and required ACM certificate ARN before applying it. Review planned changes and potential costs before provisioning.

**Traffic path:** Client → ALB (HTTPS) → EC2 (HTTP port 80) → application container (port 8000) → private RDS (PostgreSQL port 5432). The ALB checks `/health` on its target group. The EC2 instance has a public IP, but its configured inbound application rule accepts traffic only from the ALB security group.

### AWS release workflow

Publishing a GitHub Release with a tag beginning in `v` triggers `.github/workflows/deploy.yml`. The tag must point to a commit contained in `main`.

1. GitHub Actions assumes an AWS role using OIDC (secret `AWS_DEPLOY_ROLE_ARN`).
2. The workflow builds the multi-stage Docker image and pushes `gifff:<tag>` to ECR in `us-east-2`.
3. It locates the running EC2 instance tagged `Name=gifff-app` and RDS instance `gifff-postgres`.
4. AWS Systems Manager runs `deploy/remote-deploy.sh` on EC2.
5. The script retrieves RDS credentials, a JWT signing secret and the Datadog API key via AWS Secrets Manager, pulls the image, runs Alembic migrations and starts the Compose services.
6. It checks containers and performs a local HTTP smoke test.

The AWS Compose file (`deploy/compose.yaml`) runs the application and a Datadog Agent. The supporting AWS infrastructure is defined in `infra/`, while the release workflow deploys application images to the existing EC2 instance.

**Production considerations:** `deploy/compose.yaml` binds host port 80. Terraform configures HTTPS at the ALB and restricts EC2 application ingress to the ALB security group; verify deployed DNS, certificates and network rules. The current runtime settings default `AUTH_COOKIE_SECURE` to `false`, and the deployment Compose file does not override it: enable secure cookies for HTTPS use. The backend also calls `app.frontend()` when its built frontend directory exists; that method is not part of standard FastAPI. Correct or verify static-file serving before relying on the production image.

## Database monitoring

The SQLAlchemy async engine supports the following optional environment variables:

| Variable | Default | Meaning |
| --- | --- | --- |
| `DATABASE_POOL_SIZE` | `10` | Base pool size |
| `DATABASE_POOL_MAX_OVERFLOW` | `5` | Additional connections |
| `DATABASE_POOL_PRE_PING` | `true` | Connection validation |
| `DATABASE_ECHO` | `false` | SQL logging |
| `DATABASE_ECHO_POOL` | `false` | Pool event logging (`true` or `debug`) |

The pool monitor reports normal, overflow and limit states. In AWS, Datadog collects APM traces and container logs. Avoid verbose SQL or pool logs in production unless troubleshooting.

## License

MIT — see [LICENSE](LICENSE).
