import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_EXTERNAL) {
  throw new Error('DATABASE_URL or DATABASE_URL_EXTERNAL environment variable is not set');
}

const databaseUrl = process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL;

export const client = postgres(databaseUrl);
export const db = drizzle(client);
