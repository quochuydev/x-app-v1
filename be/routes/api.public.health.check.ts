import type { FastifyInstance } from 'fastify';
import { db } from '../db';
import type { HealthCheckResponse } from '../types';

export default async function healthCheckRoute(fastify: FastifyInstance) {
  // Root health check
  fastify.get('/', async (): Promise<HealthCheckResponse> => {
    try {
      await db.execute('SELECT 1');
      return { status: 'healthy', database: 'connected' };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
      };
    }
  });

  // API health check with timestamp
  fastify.get('/api/healthcheck', async (): Promise<HealthCheckResponse> => {
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