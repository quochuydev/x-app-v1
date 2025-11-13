import type { IncomingHttpHeaders } from 'node:http';
import type { AuthUser } from '../types';

/**
 * Extract user information from request headers.
 *
 * In production:
 * - Validate JWT from Authorization header or cookie
 * - Decode token and extract user claims
 * - Verify token signature and expiration
 *
 * For now: Mock implementation for development
 */
export function getUserInfo(headers: IncomingHttpHeaders): AuthUser {
  const authHeader = headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized - Missing or invalid token');
  }

  const token = authHeader.substring(7);

  if (!token || token === '') {
    throw new Error('Unauthorized - Invalid token');
  }

  // Mock user extraction from token
  // In production: decode and verify JWT
  const user: AuthUser = {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
  };

  return user;
}
