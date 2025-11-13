import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import usersCreateRoute from '../routes/api.admin.users.create';

describe('Users Create Route', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(usersCreateRoute);
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('POST /users', () => {
    it('should create a new user and return 201', async () => {
      const newUser = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      };

      const response = await fastify.inject({
        method: 'POST',
        url: '/users',
        payload: newUser,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user.name).toBe(newUser.name);
      expect(body.user.email).toBe(newUser.email);
    });

    it('should return user with all required fields', async () => {
      const newUser = {
        name: 'Another User',
        email: `another-${Date.now()}@example.com`,
      };

      const response = await fastify.inject({
        method: 'POST',
        url: '/users',
        payload: newUser,
      });

      const body = JSON.parse(response.body);
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('name');
      expect(body.user).toHaveProperty('email');
      expect(body.user).toHaveProperty('active');
      expect(body.user).toHaveProperty('createdAt');
      expect(body.user).toHaveProperty('updatedAt');
    });
  });
});
