# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 self-hosting demo application that showcases various Next.js features including caching, ISR, database operations, streaming, and middleware. The app is designed to run in Docker containers with PostgreSQL and Nginx.

**Technology Stack:**
- Next.js 15.1.2 with React 19.0.0 and App Router
- PostgreSQL with Drizzle ORM
- Bun as package manager and runtime
- Docker with Docker Compose for containerization
- Nginx as reverse proxy

## Development Commands

```bash
# Development
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server from standalone build

# Database Operations
bun run db:generate  # Generate Drizzle migrations
bun run db:push      # Push schema changes to database
bun run db:studio    # Open Drizzle Studio for database inspection

# Docker (local development)
docker-compose up -d # Start all services in background
docker-compose down  # Stop all services
docker-compose ps    # Check container status
docker-compose logs web  # View Next.js application logs
docker-compose logs cron # View cron job logs
```

## Architecture Overview

### App Router Structure
- Uses Next.js App Router with server components by default
- Client components explicitly marked with `'use client'`
- File-based routing with nested layouts and route groups

### Feature Organization
Each major feature is organized in its own directory under `/app/`:

- **`/app/db/`**: Todo CRUD demo with Drizzle ORM and Server Actions
  - `schema.ts`: Database schema definition
  - `drizzle.ts`: Database connection setup
  - `actions.ts`: Server actions for data mutations
  - `page.tsx`: Todo list interface
  - `clear/route.ts`: Route handler for clearing todos

- **`/app/isr/`**: Incremental Static Regeneration demo
  - Fetches Pokemon data with 10-second revalidation
  - Shows client-side freshness timer

- **`/app/streaming/`**: Streaming demo with Suspense
  - Progressive content loading demonstration

- **`/app/protected/`**: Middleware-protected route
  - Cookie-based authentication demonstration

### Database Architecture
- **PostgreSQL** with **Drizzle ORM** as the data layer
- Server Actions for data mutations (automatic revalidation)
- Database accessible via Drizzle Studio or direct psql connection
- Automatic data clearing via cron job every 10 minutes

### Container Architecture
- **Multi-container setup**: web service (Next.js), database (PostgreSQL), cron (Alpine)
- Custom bridge network for inter-service communication
- Production-ready multi-stage Dockerfile
- Nginx reverse proxy with HTTPS and rate limiting

## Key Configuration Files

- `next.config.ts`: Standalone output mode, image optimization, compression disabled for streaming
- `drizzle.config.ts`: Drizzle ORM configuration pointing to schema
- `middleware.ts`: Route protection for `/protected` endpoint
- `docker-compose.yml`: Local development container setup
- `deploy.sh`: Production deployment automation script

## Environment Variables

Required variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_URL_EXTERNAL`: External database URL for Drizzle
- `SECRET_KEY`: Server-side secret
- `NEXT_PUBLIC_SAFE_KEY`: Client-safe secret (prefix required)

## Development Patterns

### Server Components
- Default for all components unless explicitly marked client
- Database queries and API calls performed directly in components
- Environment variables read dynamically on server

### Client Components
- Marked with `'use client'` directive
- Used for interactivity (forms, timers, state management)
- State management with React hooks

### Server Actions
- Marked with `'use server'` directive
- Used for form submissions and data mutations
- Automatic page revalidation after data changes

## Deployment

### Local Development
Use `docker-compose up -d` to start all services locally. The app will be available at `http://localhost:3000`.

### Production Deployment
The `deploy.sh` script handles:
- Server setup (Docker, Nginx, SSL certificates)
- Application deployment and database initialization
- Nginx configuration with HTTPS and rate limiting
- Cron job setup for automatic data clearing

For subsequent updates, use the `update.sh` script.

## Important Notes

- **Turbopack**: Development server uses Turbopack for faster builds
- **Standalone Output**: Configured for containerized deployment (80%+ size reduction)
- **No Compression**: Disabled in Next.js (handled by Nginx for streaming compatibility)
- **Path Aliases**: TypeScript configured with `@/*` alias for app directory
- **ISR Revalidation**: Set to 10 seconds for demo purposes
- **Database Clearing**: Automated via cron every 10 minutes