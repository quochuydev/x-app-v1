# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js backend application built with Fastify, Drizzle ORM, and PostgreSQL. It follows a file-based routing pattern where routes and middlewares are automatically loaded from their respective directories.

## Environment Setup

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 3033)
- `API_URL` - Public API URL for Swagger docs

All commands use `dotenvx` for environment variable management.

## Architecture

### Auto-Loading System

The application uses a dynamic auto-loading pattern in `index.ts`:

1. **Routes** (`/routes` directory): All route files are automatically registered at startup. Each route file exports a default function that registers Fastify routes.

2. **Middlewares** (`/middlewares` directory): All middleware files are automatically registered. Each middleware exports a default function that registers as a Fastify plugin.

### Middleware Configuration

Middlewares are conditionally applied based on route patterns defined in `middlewares/config.ts`:

- Uses glob-style pattern matching (`*` for wildcards)
- More specific patterns take precedence
- Middleware subjects reference files in the `/middlewares` directory
- Pattern: `/api/admin/*` applies `service.admin.auth.adapt` middleware

Current configuration:

- `/api/admin/*` routes require authentication (mock implementation)
- `/api/public/*` routes have no middleware
- `/api/*` base routes have no middleware

### Database Layer

- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Defined in `db/schema.ts` using Drizzle's schema builder
- **Connection**: Single client instance exported from `db/index.ts`
- **Migrations**: Stored in `/drizzle` directory, managed via `drizzle-kit`

### Type System

- All types centralized in `types/index.ts`
- Uses Drizzle's `InferSelectModel` and `InferInsertModel` for type safety
- Includes API request/response types, auth types, and middleware types
- Path alias `@/*` maps to repository root

### Route Structure

Routes follow the naming convention: `api.<scope>.<resource>.<action>.ts`

Examples:

- `api.admin.users.create.ts` → POST `/api/admin/users/create`
- `api.admin.users.getList.ts` → GET `/api/admin/users/list`
- `api.healthcheck.ts` → GET `/api/healthcheck`

Each route file:

1. Exports a default async function accepting `FastifyInstance`
2. Registers one or more routes with OpenAPI schema
3. Implements handler logic with proper typing from `types/index.ts`

### Test Structure

Tests use Vitest and follow the pattern:

- Test files: `api.<scope>.<resource>.<action>.spec.ts`
- Fixture files: `api.<scope>.<resource>.<action>.fixture.ts`
- Each test creates a standalone Fastify instance
- Uses Fastify's `inject()` method for HTTP testing
- Cleanup with `beforeAll`/`afterAll` hooks

### Authentication (Current State)

Authentication is currently a mock implementation:

- `middlewares/api.admin.auth.adapt.ts` sets mock admin user on requests
- Ready for production implementation: replace mock logic with JWT validation

## API Documentation

Swagger UI available at `http://localhost:3033/docs` when server is running.

## Adding New Features

### Adding a Route

1. Create file in `/routes` following naming convention: `api.<scope>.<resource>.<action>.ts`
2. Export default function that registers Fastify route(s)
3. Define OpenAPI schema in route options
4. Import and use types from `types/index.ts`
5. Route is automatically loaded at startup

### Adding a Middleware

1. Create file in `/middlewares` with descriptive name
2. Export default function that registers Fastify plugin
3. Update `middlewares/config.ts` to apply middleware to specific route patterns
4. Middleware is automatically loaded at startup

### Adding Tests

1. Create spec file: `tests/api.<scope>.<resource>.<action>.spec.ts`
2. Optionally create fixture file for shared test data
3. Import route handler and create standalone Fastify instance
4. Use `fastify.inject()` for HTTP assertions
5. Run with `npm test` or `vitest <file>`
