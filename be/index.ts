import '@dotenvx/dotenvx/config';
import { eq } from 'drizzle-orm';
import Fastify from 'fastify';
import { db } from './db';
import { users } from './db/schema';

const fastify = Fastify({
  logger: true,
});

const PORT = Number(process.env.PORT) || 3030;

// Health check endpoints
fastify.get('/', async () => {
  try {
    await db.execute('SELECT 1');
    return { status: 'healthy', database: 'connected' };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    };
  }
});

fastify.get('/api/healthcheck', async () => {
  try {
    await db.execute('SELECT 1');
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
});

// Get all users
fastify.get('/users', async () => {
  const allUsers = await db.select().from(users);
  return { users: allUsers };
});

// Get user by ID
fastify.get<{ Params: { id: string } }>(
  '/users/:id',
  async (request, reply) => {
    const { id } = request.params;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)));

    if (user.length === 0) {
      reply.code(404);
      return { error: 'User not found' };
    }

    return { user: user[0] };
  },
);

// Create user
fastify.post<{ Body: { name: string; email: string } }>(
  '/users',
  async (request, reply) => {
    const { name, email } = request.body;

    const newUser = await db.insert(users).values({ name, email }).returning();

    reply.code(201);
    return { user: newUser[0] };
  },
);

// Update user
fastify.put<{
  Params: { id: string };
  Body: { name?: string; email?: string };
}>('/users/:id', async (request, reply) => {
  const { id } = request.params;
  const { name, email } = request.body;

  const updated = await db
    .update(users)
    .set({ name, email, updatedAt: new Date() })
    .where(eq(users.id, Number(id)))
    .returning();

  if (updated.length === 0) {
    reply.code(404);
    return { error: 'User not found' };
  }

  return { user: updated[0] };
});

// Delete user
fastify.delete<{ Params: { id: string } }>(
  '/users/:id',
  async (request, reply) => {
    const { id } = request.params;

    const deleted = await db
      .delete(users)
      .where(eq(users.id, Number(id)))
      .returning();

    if (deleted.length === 0) {
      reply.code(404);
      return { error: 'User not found' };
    }

    reply.code(204);
    return;
  },
);

// Start server
async function start() {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
