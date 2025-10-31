import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  content: varchar('content', { length: 255 }).notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const klines = pgTable('klines', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  interval: varchar('interval', { length: 10 }).notNull(),
  openTime: timestamp('open_time').notNull(),
  closeTime: timestamp('close_time').notNull(),
  openPrice: decimal('open_price', { precision: 20, scale: 8 }).notNull(),
  highPrice: decimal('high_price', { precision: 20, scale: 8 }).notNull(),
  lowPrice: decimal('low_price', { precision: 20, scale: 8 }).notNull(),
  closePrice: decimal('close_price', { precision: 20, scale: 8 }).notNull(),
  volume: decimal('volume', { precision: 20, scale: 8 }).notNull(),
  quoteAssetVolume: decimal('quote_asset_volume', { precision: 20, scale: 8 }).notNull(),
  takerBuyBaseAssetVolume: decimal('taker_buy_base_asset_volume', { precision: 20, scale: 8 }).notNull(),
  takerBuyQuoteAssetVolume: decimal('taker_buy_quote_asset_volume', { precision: 20, scale: 8 }).notNull(),
  trades: integer('trades').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
