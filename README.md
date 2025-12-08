# URL Shortener - Django + React TypeScript Application

A full-stack URL shortener application built with Django backend and React TypeScript frontend, containerized with Docker and PostgreSQL.

## Project Structure

```
url-short/
├── backend/          # Django backend application
├── frontend/         # React TypeScript frontend application
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Docker Desktop installed and running
- Git (optional, for version control)

## Setup Instructions

### 1. Environment Configuration

The application uses environment variables for all configuration. You need to create `.env` files from the provided examples:

#### Root `.env` file (for Docker Compose)

```bash
cp .env.example .env
```

Edit `.env` and configure:
- PostgreSQL database credentials
- Service ports
- Container names

#### Backend `.env` file

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and configure:
- Django secret key (change in production!)
- Debug mode
- Allowed hosts
- Database connection settings
- CORS allowed origins

#### Frontend `.env` file

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and configure:
- API base URL
- Development server port

### 2. Build and Start Services

Build and start all services (PostgreSQL, Django backend, React frontend):

```bash
docker-compose up --build
```

Or run in detached mode:

```bash
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5433 (credentials from `.env`)

### 4. Database Migrations

The Django backend automatically runs migrations on startup via the `docker-entrypoint.sh` script. If you need to run migrations manually:

```bash
docker-compose exec backend python manage.py migrate
```

### 5. Create Django Superuser (Optional)

To access the Django admin panel:

```bash
docker-compose exec backend python manage.py createsuperuser
```

Then access the admin at: http://localhost:8000/admin

## Docker Commands

### Start services
```bash
docker-compose up
```

### Start services in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes (⚠️ deletes database data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Execute commands in containers
```bash
# Backend
docker-compose exec backend python manage.py <command>

# Frontend
docker-compose exec frontend npm <command>

# Database
docker-compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

### Rebuild services
```bash
docker-compose up --build
```

## Development

### Backend Development

The backend code is mounted as a volume, so changes to Python files will be reflected immediately. However, you may need to restart the container for some changes:

```bash
docker-compose restart backend
```

### Frontend Development

The frontend code is mounted as a volume with hot module replacement enabled. Changes to React/TypeScript files will automatically reload in the browser.

### Database Access

Connect to PostgreSQL using any PostgreSQL client with:
- Host: `localhost`
- Port: `5433` (or value from `.env`)
- Database: Value from `POSTGRES_DB` in `.env`
- Username: Value from `POSTGRES_USER` in `.env`
- Password: Value from `POSTGRES_PASSWORD` in `.env`

## Environment Variables

All configuration is managed through environment variables. See the `.env.example` files for required variables:

- **Root `.env.example`**: Docker Compose configuration
- **`backend/.env.example`**: Django settings
- **`frontend/.env.example`**: React/Vite configuration

## Troubleshooting

### Port already in use

If you get port conflicts, change the ports in your `.env` file:
- `BACKEND_PORT` for Django
- `FRONTEND_PORT` for React
- `POSTGRES_PORT` for PostgreSQL

### Database connection errors

Ensure:
1. PostgreSQL container is healthy: `docker-compose ps`
2. Database credentials in `backend/.env` match those in root `.env`
3. `DB_HOST=db` in `backend/.env` (uses Docker service name)

### Frontend can't connect to backend

Check:
1. `VITE_API_BASE_URL` in `frontend/.env` matches your backend URL
2. CORS settings in `backend/.env` include your frontend URL
3. Both services are running: `docker-compose ps`

## Production Considerations

⚠️ **This setup is for development only.** For production:

1. Change `SECRET_KEY` in `backend/.env` to a secure random value
2. Set `DEBUG=False` in `backend/.env`
3. Configure proper `ALLOWED_HOSTS` in `backend/.env`
4. Use production-ready web servers (gunicorn/uwsgi for Django, nginx for React)
5. Set up proper SSL/TLS certificates
6. Use managed database services or properly secured PostgreSQL
7. Review and harden security settings

## License

[Your License Here]

