import '@dotenvx/dotenvx/config';

export const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3033',
};

console.log(`config`, JSON.stringify(config, null, 2));
