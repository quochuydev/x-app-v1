import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import type { UsersListResponse } from '../types';

export default async function usersGetListRoute(fastify: FastifyInstance) {
  fastify.post('/api/admin/users/getList', {
    schema: {
      tags: ['admin'],
      description: 'Get list of all users',
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
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
  }, async (): Promise<UsersListResponse> => {
    const allUsers = await db.select().from(users);
    return { users: allUsers };
  });
}