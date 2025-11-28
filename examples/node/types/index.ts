import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { users } from '../db/schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Database types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// API Request/Response types
export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  active?: boolean;
}

export interface UserResponse {
  user: User;
}

export interface UsersListResponse {
  users: User[];
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  timestamp?: string;
  error?: string;
}

// Route handler types
export type RouteHandler<TParams = unknown, TBody = unknown, TQuery = unknown> = (
  request: FastifyRequest<{
    Params: TParams;
    Body: TBody;
    Querystring: TQuery;
  }>,
  reply: FastifyReply
) => Promise<unknown>;

// Auth types
export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthRequest extends FastifyRequest {
  user?: AuthUser;
}

// Middleware types
export type Middleware = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void>;

export type MiddlewareConfig = {
  [pattern: string]: string[];
};

// Simple route handler (new convention)
export type SimpleRouteHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<any>;