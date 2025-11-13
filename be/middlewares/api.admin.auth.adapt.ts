import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthUser } from '../types';

// Simple authentication middleware
// In production, you would validate JWT tokens or sessions
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Unauthorized - Missing or invalid token' });
      return;
    }

    const token = authHeader.substring(7);

    // In production, validate the JWT token here
    // For now, we'll do a simple check
    if (!token || token === '') {
      reply.code(401).send({ error: 'Unauthorized - Invalid token' });
      return;
    }

    // Mock user extraction from token
    // In production, decode and verify JWT
    const user: AuthUser = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
    };

    // Attach user to request
    (request as any).user = user;
  } catch (error) {
    reply.code(401).send({ error: 'Unauthorized - Token validation failed' });
  }
}

// Optional: Admin check middleware
export async function adminMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = (request as any).user as AuthUser | undefined;

  if (!user) {
    reply.code(403).send({ error: 'Forbidden - User not authenticated' });
    return;
  }

  // In production, check if user has admin role
  // For now, we'll allow all authenticated users
}
