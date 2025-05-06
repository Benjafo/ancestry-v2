# Ancestry Research Service

This repository contains the Ancestry genealogy research service application, which includes a React frontend, Node.js/Express backend, and PostgreSQL database. The application provides a platform for professional genealogists to conduct research for clients and present the results in an interactive family tree.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

```
ancestry/
├── client/                # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── api/           # API client
│       └── utils/         # Utility functions
├── server/                # Express backend
│   ├── bin/               # Server startup scripts
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── docs/              # Documentation
│   ├── middleware/        # Express middleware
│   ├── models/            # Sequelize models
│   ├── repositories/      # Data access layer
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── validations/       # Request validation
│   └── views/             # Server-rendered views
├── schema.sql             # Database schema
├── constraints.sql        # Database constraints
├── docker-compose.yml     # Production Docker Compose configuration
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

## Architecture

The application follows a multi-layered architecture:

### Frontend (React)

- **React**: UI library for building the user interface
- **React Router**: Client-side routing
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework

### Backend (Node.js/Express)

- **Express**: Web framework for Node.js
- **Sequelize**: ORM for PostgreSQL
- **JWT**: Authentication mechanism
- **Express Validator**: Request validation

### Data Access Layer

The backend implements a comprehensive data access layer with the following components:

- **Repositories**: Abstract database operations and provide data access methods
- **Services**: Implement business logic and orchestrate data access
- **Controllers**: Handle HTTP requests and responses
- **Routes**: Define API endpoints

For detailed documentation on the data access layer, see [Data Access Layer Documentation](server/docs/data-access-layer.md).

### Database (PostgreSQL)

- **PostgreSQL**: Relational database for storing genealogical data
- **Constraints**: Database-level constraints for data integrity
- **Indexes**: Performance optimization for common queries

## Environment Variables

### Client Environment Variables

- `NODE_ENV`: Set to `development` or `production`
- `VITE_API_URL`: URL of the backend API

### Server Environment Variables

- `NODE_ENV`: Set to `development` or `production`
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `CLIENT_ORIGIN`: Allowed origin for CORS
- `PORT`: Port for the Express server (default: 3000)

### Database Environment Variables

- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name
- `POSTGRES_HOST`: PostgreSQL host (default: localhost)
- `POSTGRES_PORT`: PostgreSQL port (default: 5432)

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

The PostgreSQL database is initialized with the schema defined in `schema.sql` and constraints in `constraints.sql`. The data is persisted in a Docker volume named `postgres-data`.

### Data Model

The database schema includes the following core entities:

- **Persons**: Individual biographical information
- **Relationships**: Connections between individuals
- **Events**: Significant life events
- **Documents**: Supporting documentation and media files

### Connecting to the Database

To connect to the database:

```bash
docker-compose exec db psql -U postgres -d ancestry
```

### Database Migrations

Database migrations are managed using Sequelize migrations. To create a new migration:

```bash
cd server
npx sequelize-cli migration:generate --name migration-name
```

To run migrations:

```bash
cd server
npx sequelize-cli db:migrate
```

## API Documentation

The API provides endpoints for managing genealogical data:

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in a user
- `POST /api/auth/refresh`: Refresh an access token
- `POST /api/auth/reset-password`: Request a password reset

### Persons

- `GET /api/persons`: Get all persons
- `GET /api/persons/:personId`: Get a person by ID
- `POST /api/persons`: Create a new person
- `PUT /api/persons/:personId`: Update a person
- `DELETE /api/persons/:personId`: Delete a person
- `GET /api/persons/:personId/events`: Get events for a person
- `GET /api/persons/:personId/relationships`: Get relationships for a person
- `GET /api/persons/:personId/documents`: Get documents for a person
- `GET /api/persons/:personId/ancestors`: Get ancestors of a person
- `GET /api/persons/:personId/descendants`: Get descendants of a person

### Relationships

- `GET /api/relationships`: Get all relationships
- `GET /api/relationships/:relationshipId`: Get a relationship by ID
- `POST /api/relationships`: Create a new relationship
- `PUT /api/relationships/:relationshipId`: Update a relationship
- `DELETE /api/relationships/:relationshipId`: Delete a relationship
- `GET /api/relationships/person/:personId`: Get relationships for a person
- `GET /api/relationships/type/:type`: Get relationships by type
- `GET /api/relationships/between/:person1Id/:person2Id`: Get relationships between two persons
- `GET /api/relationships/path/:person1Id/:person2Id`: Find relationship path between two persons
- `GET /api/relationships/parent-child`: Get parent-child relationships
- `GET /api/relationships/spouse`: Get spouse relationships

### Projects

- `GET /api/projects`: Get all projects
- `GET /api/projects/:id`: Get a project by ID
- `POST /api/projects`: Create a new project
- `PUT /api/projects/:id`: Update a project

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

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

[MIT License](LICENSE)
