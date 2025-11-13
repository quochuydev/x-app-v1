import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface ErrorResponse {
  error: string;
}

export default async function authAdaptRoute(fastify: FastifyInstance) {
  // Login endpoint
  fastify.post<{ Body: LoginRequest }>(
    '/auth/login',
    async (
      request: FastifyRequest<{ Body: LoginRequest }>,
      reply: FastifyReply
    ): Promise<LoginResponse | ErrorResponse> => {
      const { email, password } = request.body;

      // Validate input
      if (!email || !password) {
        reply.code(400);
        return { error: 'Email and password are required' };
      }

      try {
        // Find user by email
        const user = await db.select().from(users).where(eq(users.email, email));

        if (user.length === 0) {
          reply.code(401);
          return { error: 'Invalid credentials' };
        }

        // In production, verify password hash
        // For now, we'll accept any password for demo purposes
        // const isValidPassword = await bcrypt.compare(password, user[0].passwordHash);

        // Generate JWT token
        // In production, use a proper JWT library like jsonwebtoken
        const token = `mock-jwt-token-${user[0].id}-${Date.now()}`;

        return {
          token,
          user: {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
          },
        };
      } catch (error: any) {
        reply.code(500);
        return { error: 'Internal server error' };
      }
    }
  );

  // Logout endpoint (optional, for token invalidation)
  fastify.post(
    '/auth/logout',
    async (): Promise<{ message: string }> => {
      // In production, invalidate the token
      // This could involve adding it to a blacklist or removing from a whitelist
      return { message: 'Logged out successfully' };
    }
  );

  // Get current user endpoint (protected)
  fastify.get(
    '/auth/me',
    {
      // In production, add auth middleware here
      // preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Get user from request (set by auth middleware)
      const user = (request as any).user;

      if (!user) {
        reply.code(401);
        return { error: 'Unauthorized' };
      }

      return { user };
    }
  );
}
