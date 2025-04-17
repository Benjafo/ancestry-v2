# Ancestry Project Docker Configuration

This repository contains Docker configuration for the Ancestry genealogy research service application, which includes a React frontend, Node.js/Express backend, and PostgreSQL database.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

```
ancestry/
├── client/                # React frontend
├── server/                # Express backend
├── schema.sql             # Database schema
├── docker-compose.yml     # Production Docker Compose configuration
├── docker-compose.dev.yml # Development Docker Compose configuration
└── README.md              # This file
```

## Getting Started

### Development Mode

To run the application in development mode with hot-reloading:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will:
- Start the React frontend at http://localhost:5173
- Start the Express backend at http://localhost:3000
- Start the PostgreSQL database at localhost:5432
- Mount your local directories as volumes for hot-reloading

### Production Mode

To build and run the application in production mode:

```bash
docker-compose up --build
```

This will:
- Build optimized Docker images for the frontend and backend
- Start the React frontend at http://localhost:80
- Start the Express backend at http://localhost:3000
- Start the PostgreSQL database at localhost:5432

## Environment Variables

### Client Environment Variables

- `NODE_ENV`: Set to `development` or `production`
- `VITE_API_URL`: URL of the backend API

### Server Environment Variables

- `NODE_ENV`: Set to `development` or `production`
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication

### Database Environment Variables

- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name

## Common Commands

### View Logs

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs client
docker-compose logs server
docker-compose logs db
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop all services and remove volumes
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose up --build

# Rebuild a specific service
docker-compose up --build client
```

## Database

The PostgreSQL database is initialized with the schema defined in `schema.sql`. The data is persisted in a Docker volume named `postgres-data`.

To connect to the database:

```bash
docker-compose exec db psql -U postgres -d ancestry
```

## Troubleshooting

### Container Won't Start

If a container fails to start, check the logs:

```bash
docker-compose logs [service_name]
```

### Database Connection Issues

If the server can't connect to the database, make sure:
1. The database container is running
2. The `DATABASE_URL` environment variable is correct
3. The database has been initialized with the schema

### Frontend Can't Connect to Backend

If the frontend can't connect to the backend, make sure:
1. The backend container is running
2. The `VITE_API_URL` environment variable is correct
3. The backend is accessible from the frontend container

## License

[Your License Here]
