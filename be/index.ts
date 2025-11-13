import '@dotenvx/dotenvx/config';
import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { config } from './config';

const fastify = Fastify({
  logger: true,
});

const PORT = Number(process.env.PORT);

async function loadMiddlewares() {
  const middlewaresDir = join(import.meta.dirname || __dirname, 'middlewares');
  const files = readdirSync(middlewaresDir);

  for (const file of files) {
    try {
      const middlewarePath = join(middlewaresDir, file);
      const middlewareUrl = pathToFileURL(middlewarePath).href;
      const middlewareModule = await import(middlewareUrl);
      const middlewareHandler = middlewareModule.default;

      if (typeof middlewareHandler === 'function') {
        await fastify.register(middlewareHandler);
        fastify.log.info(`Registered middleware: ${file}`);
      }
    } catch (error) {
      fastify.log.error({ error, file }, `Failed to load middleware ${file}`);
    }
  }
}

async function loadRoutes() {
  const routesDir = join(import.meta.dirname || __dirname, 'routes');
  const files = readdirSync(routesDir);

  for (const file of files) {
    try {
      const routePath = join(routesDir, file);
      const routeUrl = pathToFileURL(routePath).href;
      const routeModule = await import(routeUrl);
      const routeHandler = routeModule.default;

      if (typeof routeHandler === 'function') {
        await fastify.register(routeHandler);
        fastify.log.info(`Registered route: ${file}`);
      }
    } catch (error) {
      fastify.log.error({ error, file }, `Failed to load route ${file}`);
    }
  }
}

async function start() {
  try {
    // Register Swagger
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'X App API',
          description: 'API documentation for X App',
          version: '1.0.0',
        },
        servers: [
          {
            url: config.apiUrl,
            description: 'Production server',
          },
          {
            url: `http://localhost:${PORT}`,
            description: 'Local server',
          },
        ],
        tags: [
          { name: 'admin', description: 'Admin endpoints' },
          { name: 'public', description: 'Public endpoints' },
        ],
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    });

    await loadMiddlewares();
    await loadRoutes();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(
      `📚 API Documentation available at http://localhost:${PORT}/docs`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
