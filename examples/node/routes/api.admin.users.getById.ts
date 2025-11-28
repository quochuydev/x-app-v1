import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { UserResponse, ErrorResponse } from '../types';

interface GetByIdBody {
  id: number;
}

export default async function usersGetByIdRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: GetByIdBody }>(
    '/api/admin/users/getById',
    {
      schema: {
        tags: ['admin'],
        description: 'Get user by ID',
        body: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'number', description: 'User ID' },
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
      request: FastifyRequest<{ Body: GetByIdBody }>,
      reply: FastifyReply
    ): Promise<UserResponse | ErrorResponse> => {
      const { id } = request.body;
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (user.length === 0) {
        reply.code(404);
        return { error: 'User not found' };
      }

      return { user: user[0] };
    }
  );
}
