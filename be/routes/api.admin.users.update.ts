import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { UpdateUserRequest, UserResponse, ErrorResponse } from '../types';

interface UpdateParams {
  id: string;
}

export default async function usersUpdateRoute(fastify: FastifyInstance) {
  fastify.put<{ Params: UpdateParams; Body: UpdateUserRequest }>(
    '/users/:id',
    async (
      request: FastifyRequest<{ Params: UpdateParams; Body: UpdateUserRequest }>,
      reply: FastifyReply
    ): Promise<UserResponse | ErrorResponse> => {
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
    }
  );
}
