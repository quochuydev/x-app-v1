import type { HealthCheckResponse } from '../types';

export const healthyResponse: HealthCheckResponse = {
  status: 'healthy',
  database: 'connected',
};

export const healthyResponseWithTimestamp: HealthCheckResponse = {
  status: 'healthy',
  database: 'connected',
  timestamp: '2024-01-01T00:00:00.000Z',
};

export const unhealthyResponse: HealthCheckResponse = {
  status: 'unhealthy',
  database: 'disconnected',
  error: 'Database connection failed',
};

export const unhealthyResponseWithTimestamp: HealthCheckResponse = {
  status: 'unhealthy',
  database: 'disconnected',
  timestamp: '2024-01-01T00:00:00.000Z',
  error: 'Database connection failed',
};