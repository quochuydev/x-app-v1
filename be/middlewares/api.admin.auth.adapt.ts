import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthUser } from '../types';

export async function adminMiddleware(
  request: FastifyRequest,
  _: FastifyReply,
): Promise<void> {
  const user: AuthUser = {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
  };

  (request as any).user = user;

  console.log(`debug:user`, user);
}
