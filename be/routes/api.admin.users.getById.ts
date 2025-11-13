import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { UserResponse, ErrorResponse } from '../types';

interface GetByIdParams {
  id: string;
}

export default async function usersGetByIdRoute(fastify: FastifyInstance) {
  fastify.get<{ Params: GetByIdParams }>(
    '/users/:id',
    async (
      request: FastifyRequest<{ Params: GetByIdParams }>,
      reply: FastifyReply
    ): Promise<UserResponse | ErrorResponse> => {
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
    }
  );
}
