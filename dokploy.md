# Deploying Node.js App to Dokploy

This guide provides step-by-step instructions for deploying your Node.js application (with Fastify, Drizzle ORM, and PostgreSQL) to Dokploy.

## Prerequisites

- Dokploy instance up and running
- Git repository with your application code
- Domain name (optional, for custom domain)

## Step 1: Prepare Your Application

### 1.1 Using Taskfile with Dokploy

Your project includes a `Taskfile.yml` which provides several advantages for deployment:

**Benefits:**
- **Consistent commands** across local dev and production
- **Simplified deployment** with `task deploy`
- **Better organization** of build, test, and database tasks
- **Easy maintenance** - one place to update commands

**Available Tasks:**
```bash
task install      # Install dependencies
task build        # Build TypeScript
task start        # Start the application
task test         # Run tests
task db:push      # Push schema to database
task db:migrate   # Run migrations
task db:studio    # Launch Drizzle Studio
```

You can use these tasks in Dokploy's build and start commands, or access them via the console.

### 1.2 Ensure Required Files

Make sure your repository contains:
- `package.json` with proper scripts
- `Taskfile.yml` (for task automation)
- `.env.example` file (template for environment variables)
- `Dockerfile` (optional, Dokploy can auto-detect Node.js)
- `.dockerignore` (recommended)

### 1.3 Update package.json Scripts

Your current scripts are configured correctly:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "dotenvx run -- tsx src/index.ts",
    "db:migrate": "dotenvx run -- drizzle-kit migrate",
    "db:push": "dotenvx run -- drizzle-kit push"
  }
}
```

## Step 2: Create PostgreSQL Database in Dokploy

1. Log in to your Dokploy dashboard
2. Navigate to your project or create a new one
3. Click **"Add Service"** � **"Database"** � **"PostgreSQL"**
4. Configure the database:
   - **Name**: `x-app-postgres` (or your preferred name)
   - **Database Name**: `x_app_db`
   - **Username**: `postgres` (or custom)
   - **Password**: Generate a strong password
   - **Version**: Select latest stable version (e.g., `16-alpine`)
5. Click **"Create Database"**
6. Wait for the database to be provisioned
7. Note the connection details (internal URL will be used by your app)

## Step 3: Deploy Your Node.js Application

### 3.1 Create New Application

1. In your Dokploy project, click **"Add Service"** � **"Application"**
2. Choose deployment method:
   - **Git Repository** (recommended)
   - **Docker Image**
   - **GitHub/GitLab integration**

### 3.2 Configure Git Repository

If using Git:
1. **Repository URL**: `https://github.com/yourusername/x-app-v1.git`
2. **Branch**: `main`
3. **Build Type**: Select **"Node.js"** or **"Dockerfile"**

### 3.3 Configure Build Settings

**Option A: Using Taskfile (recommended):**
- **Build Command**: `pnpm install && sh -c "$(curl -sL https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin && task build`
- **Start Command**: `task start`
- **Node Version**: `20` (or your preferred version)

**Option B: Using pnpm scripts:**
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Node Version**: `20` (or your preferred version)

**Option C: Using Dockerfile:**
Create a `Dockerfile` in your project root (see Step 5 below)

### 3.4 Set Environment Variables

Add the following environment variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@x-app-postgres:5432/x_app_db

# Application Configuration
NODE_ENV=production
PORT=3000

# Dotenvx (if using encrypted env files)
DOTENV_PRIVATE_KEY=your_dotenvx_private_key_if_needed
```

**Note**: Replace `YOUR_PASSWORD` with the PostgreSQL password from Step 2.

### 3.5 Configure Port

- **Port**: `3000` (or the port your Fastify app listens on)
- Ensure your `src/index.ts` uses `process.env.PORT` or defaults to 3000

### 3.6 Configure Health Check (Optional)

- **Health Check Path**: `/health` (if you have a health endpoint)
- **Health Check Interval**: `30s`

## Step 4: Run Database Migrations

After the application is deployed, you need to run migrations:

### Option 1: Using Taskfile (Console)

1. Go to your application in Dokploy
2. Click **"Console"** or **"Terminal"**
3. Run the migration command:
   ```bash
   task db:push
   # or for migrations
   task db:migrate
   ```

### Option 2: Using pnpm (Console)

1. Go to your application in Dokploy
2. Click **"Console"** or **"Terminal"**
3. Run the migration command:
   ```bash
   pnpm db:push
   # or
   pnpm db:migrate
   ```

### Option 3: Automated Migration on Deploy (Taskfile)

Create a new task in your `Taskfile.yml`:
```yaml
deploy:
  desc: Deploy application with migrations
  cmds:
    - task: db:push
    - task: start
```

Then update the Start Command in Dokploy to: `task deploy`

### Option 4: Automated Migration on Deploy (package.json)

Add a deploy script to your `package.json`:
```json
{
  "scripts": {
    "deploy": "pnpm db:push && pnpm start"
  }
}
```

Then update the Start Command in Dokploy to: `pnpm deploy`

## Step 5: Create Dockerfile (Optional but Recommended)

Create a `Dockerfile` in your project root:

### Option A: Dockerfile with Taskfile Support

```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Install pnpm and Task
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    apk add --no-cache curl && \
    sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin

WORKDIR /app

# Copy package files and Taskfile
COPY package.json pnpm-lock.yaml Taskfile.yml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript using Task
RUN task build

# Production stage
FROM node:20-alpine

# Install pnpm, Task, and dotenvx
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    apk add --no-cache curl && \
    sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin

WORKDIR /app

# Copy package files and Taskfile
COPY package.json pnpm-lock.yaml Taskfile.yml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy migrations if they exist
COPY --from=builder /app/drizzle ./drizzle

# Install dotenvx globally
RUN pnpm add -g @dotenvx/dotenvx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application using Task
CMD ["task", "start"]
```

### Option B: Dockerfile without Taskfile (using pnpm scripts)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy migrations if they exist
COPY --from=builder /app/drizzle ./drizzle

# Install dotenvx globally
RUN pnpm add -g @dotenvx/dotenvx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["pnpm", "start"]
```

Create `.dockerignore`:

```
node_modules
dist
.env
.env.*
!.env.example
*.log
.git
.gitignore
README.md
dokploy.md
.vscode
.idea
coverage
.vitest
# Keep Taskfile.yml - it's needed in the container
# !Taskfile.yml
```

**Note:** The Taskfile.yml is NOT in .dockerignore because it's needed in the container to run tasks.

## Step 6: Configure Domain (Optional)

1. Go to your application settings in Dokploy
2. Navigate to **"Domains"** section
3. Add your domain:
   - **Domain**: `api.yourdomain.com`
   - **Enable SSL**: Yes (recommended)
   - **Force HTTPS**: Yes
4. Update your DNS records to point to your Dokploy server

## Step 7: Monitoring and Logs

### View Logs
1. Go to your application in Dokploy
2. Click **"Logs"** to view application logs
3. Check for any errors during startup

### Monitor Resources
- CPU usage
- Memory usage
- Network traffic

## Step 8: Verify Deployment

1. Check application status (should show "Running")
2. Test your application:
   ```bash
   curl https://your-app-url.com/health
   ```
3. Verify database connection
4. Test API endpoints

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Application port | `3000` |
| `DOTENV_PRIVATE_KEY` | Dotenvx private key (if using) | `dotenv://:key_xxx@dotenvx.com/vault/.env.vault` |

## Troubleshooting

### Application Won't Start

1. Check logs for errors
2. Verify environment variables are set correctly
3. Ensure database is running and accessible
4. Check if port is correctly configured

### Database Connection Failed

1. Verify `DATABASE_URL` is correct
2. Check if PostgreSQL database is running
3. Ensure network connectivity between app and database
4. Test connection from console:
   ```bash
   psql $DATABASE_URL
   ```

### Build Failed

1. Check build logs
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are listed
4. Check TypeScript configuration

### Migrations Failed

1. Run migrations manually from console
2. Check migration files in `drizzle` folder
3. Verify database permissions
4. Use `pnpm db:push` for development/first deploy

## Continuous Deployment

### Auto-deploy on Git Push

1. Go to application settings
2. Enable **"Auto Deploy"**
3. Select branch (e.g., `main`)
4. Every push to the branch will trigger a new deployment

### Manual Deployment

1. Go to your application
2. Click **"Redeploy"** button
3. Select commit/branch to deploy

## Backup Strategy

### Database Backups

1. Go to PostgreSQL service
2. Configure automatic backups
3. Set backup schedule (e.g., daily)
4. Test restore procedure

### Application Backups

Your code is backed up in Git repository. Ensure you:
- Commit and push regularly
- Tag releases
- Keep `.env.example` updated

## Scaling (If Supported by Your Dokploy Plan)

1. Go to application settings
2. Adjust **"Replicas"** for horizontal scaling
3. Configure load balancer if needed
4. Monitor resource usage

## Additional Resources

- [Dokploy Documentation](https://docs.dokploy.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Fastify Documentation](https://fastify.dev)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Using Taskfile Commands in Dokploy

Once your application is deployed, you can use Task commands via the Dokploy console:

### Common Tasks for Production

```bash
# Check available tasks
task --list

# Run database migrations
task db:push
task db:migrate

# View database in Drizzle Studio (if port forwarding is set up)
task db:studio

# Run tests
task test

# Build application
task build

# Start application (usually done automatically)
task start
```

### Creating a Deploy Task

Add this to your `Taskfile.yml` for automated deployments:

```yaml
deploy:
  desc: Deploy with database migrations
  cmds:
    - task: db:push
    - task: start

deploy:prod:
  desc: Deploy to production with migrations
  cmds:
    - echo "Running production migrations..."
    - task: db:migrate
    - echo "Starting application..."
    - task: start
```

Then in Dokploy, set the Start Command to:
- Development: `task deploy`
- Production: `task deploy:prod`

## Quick Deploy Checklist

- [ ] PostgreSQL database created in Dokploy
- [ ] Environment variables configured
- [ ] Application created and linked to Git repository
- [ ] Build and start commands configured (with Task if preferred)
- [ ] Taskfile.yml included in deployment (if using Task)
- [ ] Port configured (3000)
- [ ] Database migrations run successfully
- [ ] Application is running and healthy
- [ ] Domain configured (optional)
- [ ] SSL enabled
- [ ] Auto-deploy configured
- [ ] Backups scheduled
- [ ] Monitoring configured

## Taskfile vs package.json Scripts

| Aspect | Taskfile | package.json Scripts |
|--------|----------|---------------------|
| **Syntax** | YAML-based, more readable | JSON, limited |
| **Variables** | Built-in support | Limited |
| **Dependencies** | Task can call other tasks | Can chain with `&&` |
| **Cross-platform** | Better support | OS-dependent |
| **Learning curve** | Minimal | None (standard npm) |
| **Installation** | Requires Task binary | Built into Node.js |
| **Use in Dokploy** | Both work equally well | Both work equally well |

**Recommendation:** Use Taskfile for better organization and maintainability, especially if you have complex build/deploy workflows.
