# E-Commerce Drizzle Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the e-commerce ERD (docs/ecommerce/erd.md) into a complete Drizzle ORM schema with proper relationships, consistent naming conventions, and TypeScript types.

**Architecture:** Build a PostgreSQL database schema using Drizzle ORM that models users, products, carts, orders, and file attachments with proper foreign key relationships and indexes for optimal query performance.

**Tech Stack:** Drizzle ORM, PostgreSQL, TypeScript, Next.js

---

## Task 1: User Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Remove existing todos table and add user table**

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('customer'), // admin/user/customer
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add user table schema"
```

---

## Task 2: Product Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add product table after user table**

```typescript
export const product = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  price: varchar('price', { length: 50 }).notNull(), // stored as string to avoid floating point issues
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add product table schema"
```

---

## Task 3: File Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add file table for product images**

```typescript
export const file = pgTable('file', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add file table schema"
```

---

## Task 4: Product-File Junction Table

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add product_file junction table for many-to-many relationship**

```typescript
export const productFile = pgTable('product_file', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id').notNull().references(() => file.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add product_file junction table"
```

---

## Task 5: Cart Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add cart table**

```typescript
export const cart = pgTable('cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: varchar('amount', { length: 50 }).notNull().default('0'), // stored as string for precision
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add cart table schema"
```

---

## Task 6: Cart Item Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add cart_item table with foreign keys**

```typescript
import { integer } from 'drizzle-orm/pg-core';

export const cartItem = pgTable('cart_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').notNull().references(() => cart.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'restrict' }),
  price: varchar('price', { length: 50 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: varchar('total_price', { length: 50 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add cart_item table schema"
```

---

## Task 7: Order Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add order table with user relationship**

```typescript
export const order = pgTable('order', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  status: varchar('status', { length: 50 }).notNull().default('new'), // new/processing/cancelled/shipped
  paymentStatus: varchar('payment_status', { length: 50 }).notNull().default('unpaid'), // unpaid/paid/refunded
  amount: varchar('amount', { length: 50 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add order table schema"
```

---

## Task 8: Order Item Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add order_item table with foreign keys**

```typescript
export const orderItem = pgTable('order_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull().default(1),
  price: varchar('price', { length: 50 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add order_item table schema"
```

---

## Task 9: Add Drizzle Relations

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Import relations helper and define all relationships**

Add to imports:
```typescript
import { relations } from 'drizzle-orm';
```

Add after all table definitions:
```typescript
// Relations
export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
}));

export const productRelations = relations(product, ({ many }) => ({
  cartItems: many(cartItem),
  orderItems: many(orderItem),
  productFiles: many(productFile),
}));

export const fileRelations = relations(file, ({ many }) => ({
  productFiles: many(productFile),
}));

export const productFileRelations = relations(productFile, ({ one }) => ({
  product: one(product, {
    fields: [productFile.productId],
    references: [product.id],
  }),
  file: one(file, {
    fields: [productFile.fileId],
    references: [file.id],
  }),
}));

export const cartRelations = relations(cart, ({ many }) => ({
  cartItems: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItem.cartId],
    references: [cart.id],
  }),
  product: one(product, {
    fields: [cartItem.productId],
    references: [product.id],
  }),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  orderItems: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
}));
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add drizzle relations for all tables"
```

---

## Task 10: Generate and Review Migration

**Files:**
- Generated: `x-app/app/db/migrations/*.sql`

**Step 1: Generate Drizzle migration**

Run: `cd x-app && npm run db:generate`
Expected: Migration files created in x-app/app/db/migrations/

**Step 2: Review generated SQL migration**

Run: `cat x-app/app/db/migrations/*_*.sql`
Expected: SQL statements for creating all tables with proper foreign keys and indexes

**Step 3: Commit migration files**

```bash
git add x-app/app/db/migrations/
git commit -m "feat: generate drizzle migrations for ecommerce schema"
```

---

## Task 11: Add TypeScript Type Exports

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add type exports at the end of the file**

```typescript
// TypeScript types for insert and select operations
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;

export type File = typeof file.$inferSelect;
export type NewFile = typeof file.$inferInsert;

export type ProductFile = typeof productFile.$inferSelect;
export type NewProductFile = typeof productFile.$inferInsert;

export type Cart = typeof cart.$inferSelect;
export type NewCart = typeof cart.$inferInsert;

export type CartItem = typeof cartItem.$inferSelect;
export type NewCartItem = typeof cartItem.$inferInsert;

export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;

export type OrderItem = typeof orderItem.$inferSelect;
export type NewOrderItem = typeof orderItem.$inferInsert;
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No compilation errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add TypeScript type exports for schema"
```

---

## Task 12: Update Documentation

**Files:**
- Create: `docs/ecommerce/schema-implementation.md`

**Step 1: Create schema implementation documentation**

```markdown
# E-Commerce Schema Implementation

## Overview

This document describes the Drizzle ORM schema implementation based on the ERD in `docs/ecommerce/erd.md`.

## Schema Location

- **Schema File:** `x-app/app/db/schema.ts`
- **Migrations:** `x-app/app/db/migrations/`
- **Config:** `x-app/drizzle.config.ts`

## Tables

### user
- **Purpose:** Store user accounts (admin, user, customer roles)
- **Primary Key:** id (uuid)
- **Relations:** One-to-many with orders

### product
- **Purpose:** Store product catalog
- **Primary Key:** id (uuid)
- **Relations:** Many-to-many with files, one-to-many with cart_items and order_items

### file
- **Purpose:** Store product images and attachments
- **Primary Key:** id (uuid)
- **Relations:** Many-to-many with products via product_file

### product_file
- **Purpose:** Junction table for product-file relationship
- **Primary Key:** id (uuid)
- **Foreign Keys:** product_id, file_id

### cart
- **Purpose:** Store shopping carts
- **Primary Key:** id (uuid)
- **Relations:** One-to-many with cart_items

### cart_item
- **Purpose:** Store items in shopping carts
- **Primary Key:** id (uuid)
- **Foreign Keys:** cart_id, product_id
- **Relations:** Many-to-one with cart and product

### order
- **Purpose:** Store customer orders
- **Primary Key:** id (uuid)
- **Foreign Keys:** user_id
- **Relations:** Many-to-one with user, one-to-many with order_items
- **Status Values:** new, processing, cancelled, shipped
- **Payment Status Values:** unpaid, paid, refunded

### order_item
- **Purpose:** Store line items in orders
- **Primary Key:** id (uuid)
- **Foreign Keys:** order_id, product_id
- **Relations:** Many-to-one with order and product

## Naming Conventions

- **Tables:** Singular nouns (user, product, order)
- **Columns:** camelCase in TypeScript, snake_case in SQL (firstName → first_name)
- **Foreign Keys:** {table}Id format (userId, productId)
- **Timestamps:** createdDate, updatedDate
- **Monetary Values:** Stored as varchar to avoid floating point precision issues

## Database Commands

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Type Safety

All tables have TypeScript types exported:
- Select types: `User`, `Product`, `Order`, etc.
- Insert types: `NewUser`, `NewProduct`, `NewOrder`, etc.

## Cascading Behavior

- **cart_item.cart_id:** CASCADE on delete (deleting cart deletes items)
- **order_item.order_id:** CASCADE on delete (deleting order deletes items)
- **product_file:** CASCADE on delete for both foreign keys
- **cart_item.product_id:** RESTRICT (cannot delete product if in cart)
- **order_item.product_id:** RESTRICT (cannot delete product if ordered)
- **order.user_id:** RESTRICT (cannot delete user with orders)
```

**Step 2: Commit documentation**

```bash
git add docs/ecommerce/schema-implementation.md
git commit -m "docs: add schema implementation documentation"
```

---

## Next Steps

After implementation:

1. **Database Setup:** Set `DATABASE_URL_EXTERNAL` in environment
2. **Push Schema:** Run `npm run db:push` to create tables
3. **Verify:** Use `npm run db:studio` to inspect database
4. **Seed Data:** Create seed scripts for development data
5. **API Routes:** Build Next.js API routes for CRUD operations
6. **Testing:** Add integration tests for database operations

## Design Decisions

1. **UUID over Serial:** Better for distributed systems and security
2. **Varchar for Money:** Avoids floating point precision issues
3. **Restrict on Products:** Prevents accidental deletion of products with orders
4. **Cascade on Carts:** Carts are ephemeral, safe to cascade delete
5. **Snake Case SQL:** Following PostgreSQL conventions
6. **Timestamp over Date:** Provides more precision for audit trails
