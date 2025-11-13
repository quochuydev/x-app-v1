import type { MiddlewareConfig } from '../types';

/**
 * Middleware configuration maps route patterns to middleware subjects.
 *
 * Pattern matching:
 * - Uses glob-style patterns (* for wildcards)
 * - More specific patterns take precedence
 * - Middleware applied in array order
 * - Matches are merged (most specific first)
 *
 * Example:
 * Route: /api/admin/users/create
 * Matches: ['/api/*', '/api/admin/*']
 * Applied: ['service.api.tracing.adapt', 'service.admin.auth.adapt']
 */
export const middlewareConfig: MiddlewareConfig = {
  '/api/admin/*': [
    'service.admin.auth.adapt',
  ],
  '/api/public/*': [],
  '/api/*': [],
};
