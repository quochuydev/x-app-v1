# Routes

This directory contains all API route handlers following the naming convention:
`api.{area}.{resource}.{action}.ts`

## Naming Convention

- **area**: The access level or context (e.g., `admin`, `public`, `user`)
- **resource**: The entity being accessed (e.g., `users`, `products`, `health`)
- **action**: The operation being performed (e.g., `getList`, `getById`, `create`, `update`, `delete`, `check`)

## File Types

Each route should have three associated files:

1. **Route Handler** (`*.ts`): The main route implementation
2. **Test Spec** (`*.spec.ts`): Test cases for the route
3. **Test Fixture** (`*.fixture.ts`): Mock data and fixtures for testing

## Available Routes

### Health Check Routes
- `api.public.health.check.ts` - Health check endpoints (/, /api/healthcheck)

### Authentication Routes
- `api.admin.auth.adapt.ts` - Authentication endpoints (/auth/login, /auth/logout, /auth/me)

### User Management Routes
- `api.admin.users.getList.ts` - Get all users (GET /users)
- `api.admin.users.getById.ts` - Get user by ID (GET /users/:id)
- `api.admin.users.create.ts` - Create new user (POST /users)
- `api.admin.users.update.ts` - Update user (PUT /users/:id)
- `api.admin.users.delete.ts` - Delete user (DELETE /users/:id)

## Auto-Loading

Routes are automatically loaded and registered in `index.ts` using the `loadRoutes()` function. Any `.ts` file in this directory (excluding `.spec.ts` and `.fixture.ts` files) will be automatically registered with the Fastify server.
