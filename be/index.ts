import '@dotenvx/dotenvx/config';
import Fastify from 'fastify';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const fastify = Fastify({
  logger: true,
});

const PORT = Number(process.env.PORT) || 3030;

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
    await loadRoutes();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
