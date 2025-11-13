import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { ErrorResponse } from '../types';

interface DeleteParams {
  id: string;
}

export default async function usersDeleteRoute(fastify: FastifyInstance) {
  fastify.delete<{ Params: DeleteParams }>(
    '/users/:id',
    async (
      request: FastifyRequest<{ Params: DeleteParams }>,
      reply: FastifyReply
    ): Promise<void | ErrorResponse> => {
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
    }
  );
}
