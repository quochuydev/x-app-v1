import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  text,
  numeric,
  bigint,
} from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  content: varchar('content', { length: 255 }).notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const klines = pgTable('klines', {
  id: serial('id').primaryKey(),
  symbol: text('symbol').notNull(),
  interval: text('interval').notNull(),
  open: numeric('open').notNull(),
  high: numeric('high').notNull(),
  low: numeric('low').notNull(),
  close: numeric('close').notNull(),
  volume: numeric('volume').notNull(),
  openTime: bigint('open_time').notNull(),
  closeTime: bigint('close_time').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
