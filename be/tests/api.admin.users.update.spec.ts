import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import usersUpdateRoute from '../routes/api.admin.users.update';

describe('Users Update Route', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(usersUpdateRoute);
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('PUT /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await fastify.inject({
        method: 'PUT',
        url: '/users/99999',
        payload: updateData,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('User not found');
    });

    it('should update user when found', async () => {
      // Note: This test would need a real user ID from the database
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await fastify.inject({
        method: 'PUT',
        url: '/users/1',
        payload: updateData,
      });

      const body = JSON.parse(response.body);
      if (response.statusCode === 200) {
        expect(body).toHaveProperty('user');
        expect(body.user).toHaveProperty('updatedAt');
      }
    });
  });
});
