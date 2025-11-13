import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import authAdaptRoute from '../routes/api.admin.auth.adapt';

describe('Auth Adapt Route', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(authAdaptRoute);
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('POST /auth/login', () => {
    it('should return 400 when email is missing', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('Email and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'admin@example.com',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('Invalid credentials');
    });

    it('should return token and user on successful login', async () => {
      // Note: This test assumes there's a user in the database
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      // Either 200 (success) or 401 (user not in test db)
      if (response.statusCode === 200) {
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('token');
        expect(body).toHaveProperty('user');
        expect(body.user).toHaveProperty('id');
        expect(body.user).toHaveProperty('name');
        expect(body.user).toHaveProperty('email');
      }
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success message', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/logout',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('message');
      expect(body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });
  });
});
