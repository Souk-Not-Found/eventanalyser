# Event Analytics - Docker Setup

This document explains how to build and run the Event Analytics application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system
- At least 2GB of available RAM

## Quick Start

### Option 1: Using the build script (Recommended)

```bash
# Make the script executable (Linux/Mac)
chmod +x docker-build.sh

# Run the build script
./docker-build.sh
```

### Option 2: Manual Docker commands

```bash
# Build the Docker image
docker build -t event-analytics:latest .

# Start the application with Docker Compose
docker-compose up -d
```

## What gets created

The Docker setup creates the following services:

1. **PostgreSQL Database** (port 5432)
   - Database: `analytics_db`
   - Username: `analytics_user`
   - Password: `anasbentalouba`

2. **Event Analytics Application** (port 5000)
   - Flask backend API
   - Angular frontend (built and served by Flask)
   - Eureka client integration

## Accessing the Application

Once running, you can access:

- **Frontend**: http://localhost:5000
- **API Documentation**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/health
- **API Root**: http://localhost:5000/api

## Docker Commands

### View logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres
```

### Stop services
```bash
docker-compose down
```

### Restart services
```bash
docker-compose restart
```

### Rebuild and restart
```bash
docker-compose down
docker-compose up --build -d
```

### Access the database
```bash
# Connect to PostgreSQL container
docker exec -it event-analytics-db psql -U analytics_user -d analytics_db
```

## Environment Variables

You can customize the application by setting environment variables in the `docker-compose.yml` file:

- `SQLALCHEMY_DATABASE_URI`: Database connection string
- `EUREKA_SERVER_URL`: Eureka server URL for service discovery
- `FLASK_ENV`: Flask environment (development/production)

## Troubleshooting

### Port conflicts
If ports 5000 or 5432 are already in use, modify the `docker-compose.yml` file to use different ports:

```yaml
ports:
  - "5001:5000"  # Use port 5001 instead of 5000
```

### Database connection issues
If the app can't connect to the database, wait a few seconds for PostgreSQL to fully start, then restart the app:

```bash
docker-compose restart app
```

### Build issues
If the Docker build fails, try:

```bash
# Clean up Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t event-analytics:latest .
```

## Production Deployment

For production deployment, consider:

1. Using environment variables for sensitive data
2. Setting up proper SSL/TLS certificates
3. Configuring a reverse proxy (nginx)
4. Setting up database backups
5. Using Docker secrets for passwords

## Architecture

The Docker setup uses a multi-stage build:

1. **Stage 1**: Builds the Angular frontend
2. **Stage 2**: Sets up the Python environment and copies the built frontend

This approach ensures:
- Smaller final image size
- Better security (no build tools in production image)
- Faster builds (layer caching)
- Separation of concerns 