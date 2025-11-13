import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import type { UsersListResponse } from '../types';

export default async function usersGetListRoute(fastify: FastifyInstance) {
  fastify.get('/users', async (): Promise<UsersListResponse> => {
    const allUsers = await db.select().from(users);
    return { users: allUsers };
  });
}