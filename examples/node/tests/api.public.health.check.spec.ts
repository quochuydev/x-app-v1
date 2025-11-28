import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import healthCheckRoute from '../routes/api.healthcheck';

describe('Health Check Routes', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(healthCheckRoute);
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /', () => {
    it('should return health status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('database');
      expect(['healthy', 'unhealthy']).toContain(body.status);
      expect(['connected', 'disconnected']).toContain(body.database);
    });
  });

  describe('GET /api/healthcheck', () => {
    it('should return health status with timestamp', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/healthcheck',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('timestamp');
      expect(['healthy', 'unhealthy']).toContain(body.status);
      expect(['connected', 'disconnected']).toContain(body.database);
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });
  });
});