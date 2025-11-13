# GitHub Workflows

This directory contains GitHub Actions workflows for automated testing and CI/CD.

## Workflows

### `test.yml` - API Tests

Runs automated tests for the backend API.

**Triggers:**
- Push to `main` or `develop` branches (only when BE files change)
- Pull requests to `main` or `develop` branches (only when BE files change)

**What it does:**
1. Sets up Node.js 20 with pnpm
2. Starts PostgreSQL 16 service for testing
3. Installs dependencies
4. Runs database migrations (`pnpm db:push`)
5. Builds TypeScript (`pnpm build`)
6. Runs tests (`pnpm test --run`)
7. Uploads test results as artifacts (available for 30 days)

**Environment:**
- PostgreSQL: `testuser:testpassword@localhost:5432/testdb`
- Node.js: 20.x
- Package Manager: pnpm 9

**Test Results:**
Test results are uploaded as artifacts and can be downloaded from the Actions tab after each run.

## Local Testing

To run tests locally matching the CI environment:

```bash
# Set up test database
export DATABASE_URL="postgresql://testuser:testpassword@localhost:5432/testdb"
export NODE_ENV="test"

# Run migrations
cd be
pnpm db:push

# Run tests
pnpm test --run
```

## Adding New Workflows

When adding new workflows:
1. Create a new `.yml` file in this directory
2. Use descriptive names (e.g., `deploy.yml`, `lint.yml`)
3. Add appropriate triggers and conditions
4. Document the workflow in this README
