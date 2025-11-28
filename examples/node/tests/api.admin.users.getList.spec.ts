import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import usersGetListRoute from '../routes/api.admin.users.getList';

describe('Users GetList Route', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(usersGetListRoute);
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/users',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('users');
      expect(Array.isArray(body.users)).toBe(true);
    });

    it('should return users with correct structure', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/users',
      });

      const body = JSON.parse(response.body);
      if (body.users.length > 0) {
        const user = body.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('active');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
      }
    });
  });
});
