import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { UserResponse, ErrorResponse } from '../types';

interface UpdateUserBody {
  id: number;
  name?: string;
  email?: string;
  active?: boolean;
}

export default async function usersUpdateRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: UpdateUserBody }>(
    '/api/admin/users/update',
    {
      schema: {
        tags: ['admin'],
        description: 'Update user by ID',
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'number', description: 'User ID' },
            name: { type: 'string', description: 'User full name' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            active: { type: 'boolean', description: 'User active status' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  active: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: UpdateUserBody }>,
      reply: FastifyReply
    ): Promise<UserResponse | ErrorResponse> => {
      const { id, name, email, active } = request.body;

      const updated = await db
        .update(users)
        .set({ name, email, active, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (updated.length === 0) {
        reply.code(404);
        return { error: 'User not found' };
      }

      return { user: updated[0] };
    }
  );
}
