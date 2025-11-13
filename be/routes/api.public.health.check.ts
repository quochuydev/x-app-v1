import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import type { HealthCheckResponse } from '../types';

export default async function healthCheckRoute(fastify: FastifyInstance) {
  // API health check
  fastify.get('/api/public/health/check', {
    schema: {
      tags: ['public'],
      description: 'API health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            database: { type: 'string', enum: ['connected', 'disconnected'] },
            timestamp: { type: 'string', format: 'date-time' },
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (): Promise<HealthCheckResponse> => {
    try {
      await db.execute('SELECT 1');
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  });
}