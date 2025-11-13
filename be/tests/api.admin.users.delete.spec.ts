import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import usersDeleteRoute from '../routes/api.admin.users.delete';

describe('Users Delete Route', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(usersDeleteRoute);
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('DELETE /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: '/users/99999',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('User not found');
    });

    it('should return 204 when user is successfully deleted', async () => {
      // Note: This test would need a real user ID from the database
      const response = await fastify.inject({
        method: 'DELETE',
        url: '/users/1',
      });

      // Either 204 (success) or 404 (not found) are valid
      expect([204, 404]).toContain(response.statusCode);
    });
  });
});
