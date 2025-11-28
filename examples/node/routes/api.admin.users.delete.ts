import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { ErrorResponse } from '../types';

interface DeleteUserBody {
  id: number;
}

export default async function usersDeleteRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: DeleteUserBody }>(
    '/api/admin/users/delete',
    {
      schema: {
        tags: ['admin'],
        description: 'Delete user by ID',
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'number', description: 'User ID' },
          },
        },
        response: {
          204: {
            type: 'null',
            description: 'User successfully deleted',
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
      request: FastifyRequest<{ Body: DeleteUserBody }>,
      reply: FastifyReply
    ): Promise<void | ErrorResponse> => {
      const { id } = request.body;

      const deleted = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (deleted.length === 0) {
        reply.code(404);
        return { error: 'User not found' };
      }

      reply.code(204);
      return;
    }
  );
}
