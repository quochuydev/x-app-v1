import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import type { CreateUserRequest, UserResponse } from '../types';

export default async function usersCreateRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateUserRequest }>(
    '/api/admin/users/create',
    {
      schema: {
        tags: ['admin'],
        description: 'Create a new user',
        body: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', description: 'User full name' },
            email: { type: 'string', format: 'email', description: 'User email address' },
          },
        },
        response: {
          201: {
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
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: CreateUserRequest }>,
      reply: FastifyReply
    ): Promise<UserResponse> => {
      const { name, email } = request.body;

      const newUser = await db.insert(users).values({ name, email }).returning();

      reply.code(201);
      return { user: newUser[0] };
    }
  );
}
