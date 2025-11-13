import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import type { CreateUserRequest, UserResponse } from '../types';

export default async function usersCreateRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateUserRequest }>(
    '/users',
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
