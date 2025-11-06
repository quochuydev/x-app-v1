# E-commerce Drizzle Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the ERD from docs/ecommerce/erd.md into a complete Drizzle ORM schema with consistent naming conventions and proper relationships.

**Architecture:** Extend the existing Drizzle schema at x-app/app/db/schema.ts to include all e-commerce entities (users, products, carts, orders, files) with proper PostgreSQL types, foreign keys, and indexes. Follow the existing pattern of camelCase in TypeScript code mapping to snake_case in database columns.

**Tech Stack:** Drizzle ORM (v0.38.2), PostgreSQL, TypeScript, Next.js 15

---

## Task 1: Add User Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Import required types**

Add uuid and text types to the existing imports:

```typescript
import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  uuid,
  text,
} from 'drizzle-orm/pg-core';
```

**Step 2: Define users table**

Add the users table definition after the todos table:

```typescript
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // admin/user/customer
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Verify schema compiles**

Run: `cd x-app && npm run build`
Expected: TypeScript compilation succeeds without errors

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add users table schema"
```

---

## Task 2: Add Product and File Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Import decimal type**

Update imports to include decimal for price fields:

```typescript
import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  uuid,
  text,
  decimal,
} from 'drizzle-orm/pg-core';
```

**Step 2: Define products table**

Add the products table:

```typescript
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Define files table**

Add the files table:

```typescript
export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 4: Define product-file relationship table**

Add the many-to-many relationship table:

```typescript
export const productFiles = pgTable('product_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 5: Verify schema compiles**

Run: `cd x-app && npm run build`
Expected: TypeScript compilation succeeds without errors

**Step 6: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add products, files, and product-file relationship tables"
```

---

## Task 3: Add Cart Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Import integer type**

Update imports to include integer:

```typescript
import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  uuid,
  text,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';
```

**Step 2: Define carts table**

Add the carts table:

```typescript
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Define cart_items table**

Add the cart items table:

```typescript
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 4: Verify schema compiles**

Run: `cd x-app && npm run build`
Expected: TypeScript compilation succeeds without errors

**Step 5: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add carts and cart items tables"
```

---

## Task 4: Add Order Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Define orders table**

Add the orders table:

```typescript
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  status: varchar('status', { length: 20 }).notNull().default('new'), // new/processing/cancelled/shipped
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('unpaid'), // unpaid/paid/refunded
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Define order_items table**

Add the order items table:

```typescript
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Verify schema compiles**

Run: `cd x-app && npm run build`
Expected: TypeScript compilation succeeds without errors

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add orders and order items tables"
```

---

## Task 5: Add Drizzle Relations for Type Safety

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Import relations helper**

Add to the top of the file:

```typescript
import { relations } from 'drizzle-orm';
```

**Step 2: Define user relations**

Add after the users table definition:

```typescript
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  carts: many(carts),
}));
```

**Step 3: Define product relations**

Add after the products table definition:

```typescript
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  productFiles: many(productFiles),
}));
```

**Step 4: Define cart relations**

Add after the carts table definition:

```typescript
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  cartItems: many(cartItems),
}));
```

**Step 5: Define cart item relations**

Add after the cartItems table definition:

```typescript
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));
```

**Step 6: Define order relations**

Add after the orders table definition:

```typescript
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));
```

**Step 7: Define order item relations**

Add after the orderItems table definition:

```typescript
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
```

**Step 8: Define file relations**

Add after the files table definition:

```typescript
export const filesRelations = relations(files, ({ many }) => ({
  productFiles: many(productFiles),
}));
```

**Step 9: Define product-file relations**

Add after the productFiles table definition:

```typescript
export const productFilesRelations = relations(productFiles, ({ one }) => ({
  product: one(products, {
    fields: [productFiles.productId],
    references: [products.id],
  }),
  file: one(files, {
    fields: [productFiles.fileId],
    references: [files.id],
  }),
}));
```

**Step 10: Verify schema compiles**

Run: `cd x-app && npm run build`
Expected: TypeScript compilation succeeds without errors

**Step 11: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add Drizzle relations for type-safe queries"
```

---

## Task 6: Generate Database Migrations

**Files:**
- Generated: `x-app/app/db/migrations/0001_*.sql`
- Modified: `x-app/app/db/migrations/meta/_journal.json`

**Step 1: Generate migration**

Run: `cd x-app && npm run db:generate`
Expected: New migration file created in `x-app/app/db/migrations/`

**Step 2: Review generated SQL**

Run: `cat x-app/app/db/migrations/0001_*.sql`
Expected: SQL statements creating all new tables with proper foreign keys and constraints

**Step 3: Verify migration metadata**

Run: `cat x-app/app/db/migrations/meta/_journal.json`
Expected: New entry in the journal with the latest migration

**Step 4: Commit migrations**

```bash
git add x-app/app/db/migrations/
git commit -m "chore: generate migrations for e-commerce schema"
```

---

## Task 7: Add Indexes for Performance

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Import index helper**

Update imports:

```typescript
import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  uuid,
  text,
  decimal,
  integer,
  index,
} from 'drizzle-orm/pg-core';
```

**Step 2: Add indexes to carts table**

Modify the carts table to include indexes:

```typescript
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('carts_user_id_idx').on(table.userId),
  };
});
```

**Step 3: Add indexes to cart_items table**

Modify the cartItems table:

```typescript
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
}, (table) => {
  return {
    cartIdIdx: index('cart_items_cart_id_idx').on(table.cartId),
    productIdIdx: index('cart_items_product_id_idx').on(table.productId),
  };
});
```

**Step 4: Add indexes to orders table**

Modify the orders table:

```typescript
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('unpaid'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('orders_user_id_idx').on(table.userId),
    statusIdx: index('orders_status_idx').on(table.status),
    createdDateIdx: index('orders_created_date_idx').on(table.createdDate),
  };
});
```

**Step 5: Add indexes to order_items table**

Modify the orderItems table:

```typescript
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
}, (table) => {
  return {
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
  };
});
```

**Step 6: Add indexes to product_files table**

Modify the productFiles table:

```typescript
export const productFiles = pgTable('product_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
}, (table) => {
  return {
    productIdIdx: index('product_files_product_id_idx').on(table.productId),
    fileIdIdx: index('product_files_file_id_idx').on(table.fileId),
  };
});
```

**Step 7: Verify schema compiles**

Run: `cd x-app && npm run build`
Expected: TypeScript compilation succeeds without errors

**Step 8: Generate new migration with indexes**

Run: `cd x-app && npm run db:generate`
Expected: New migration file created with index creation statements

**Step 9: Commit**

```bash
git add x-app/app/db/schema.ts x-app/app/db/migrations/
git commit -m "feat: add database indexes for performance optimization"
```

---

## Task 8: Create TypeScript Type Exports

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add type exports at the end of the file**

Add TypeScript type exports for easy importing:

```typescript
// Type exports for use in application code
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type ProductFile = typeof productFiles.$inferSelect;
export type NewProductFile = typeof productFiles.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
```

**Step 2: Verify schema compiles**

Run: `cd x-app && npm run build`
Expected: TypeScript compilation succeeds without errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add TypeScript type exports for schema tables"
```

---

## Task 9: Update Documentation

**Files:**
- Create: `docs/ecommerce/schema-implementation.md`

**Step 1: Create schema implementation documentation**

```markdown
# E-commerce Schema Implementation

This document describes the implemented Drizzle schema based on the ERD specification.

## Tables

### users
- **id**: UUID (primary key, auto-generated)
- **firstName**: VARCHAR(100)
- **lastName**: VARCHAR(100)
- **role**: VARCHAR(20) - values: admin, user, customer (default: customer)
- **createdDate**: TIMESTAMP (auto-set)
- **updatedDate**: TIMESTAMP (auto-set)

### products
- **id**: UUID (primary key, auto-generated)
- **name**: VARCHAR(255)
- **description**: TEXT
- **price**: DECIMAL(10,2)
- **createdDate**: TIMESTAMP (auto-set)
- **updatedDate**: TIMESTAMP (auto-set)

### files
- **id**: UUID (primary key, auto-generated)
- **name**: VARCHAR(255)
- **url**: VARCHAR(500)
- **createdDate**: TIMESTAMP (auto-set)
- **updatedDate**: TIMESTAMP (auto-set)

### product_files
- **id**: UUID (primary key, auto-generated)
- **productId**: UUID (foreign key → products.id, cascade on delete)
- **fileId**: UUID (foreign key → files.id, cascade on delete)
- **createdDate**: TIMESTAMP (auto-set)

### carts
- **id**: UUID (primary key, auto-generated)
- **userId**: UUID (foreign key → users.id, cascade on delete)
- **amount**: DECIMAL(10,2) (default: 0.00)
- **createdDate**: TIMESTAMP (auto-set)
- **updatedDate**: TIMESTAMP (auto-set)

### cart_items
- **id**: UUID (primary key, auto-generated)
- **cartId**: UUID (foreign key → carts.id, cascade on delete)
- **productId**: UUID (foreign key → products.id, restrict on delete)
- **price**: DECIMAL(10,2)
- **quantity**: INTEGER (default: 1)
- **totalPrice**: DECIMAL(10,2)
- **createdDate**: TIMESTAMP (auto-set)
- **updatedDate**: TIMESTAMP (auto-set)

### orders
- **id**: UUID (primary key, auto-generated)
- **userId**: UUID (foreign key → users.id, restrict on delete)
- **status**: VARCHAR(20) - values: new, processing, cancelled, shipped (default: new)
- **paymentStatus**: VARCHAR(20) - values: unpaid, paid, refunded (default: unpaid)
- **amount**: DECIMAL(10,2)
- **createdDate**: TIMESTAMP (auto-set)
- **updatedDate**: TIMESTAMP (auto-set)

### order_items
- **id**: UUID (primary key, auto-generated)
- **orderId**: UUID (foreign key → orders.id, cascade on delete)
- **productId**: UUID (foreign key → products.id, restrict on delete)
- **quantity**: INTEGER
- **price**: DECIMAL(10,2)
- **createdDate**: TIMESTAMP (auto-set)
- **updatedDate**: TIMESTAMP (auto-set)

## Naming Conventions

- **TypeScript code**: camelCase (e.g., `createdDate`, `productId`)
- **Database columns**: snake_case (e.g., `created_date`, `product_id`)
- **Table names**: lowercase plural (e.g., `users`, `products`, `cart_items`)

## Relationships

- User → Orders (one-to-many)
- User → Carts (one-to-many)
- Order → OrderItems (one-to-many)
- Product → OrderItems (one-to-many)
- Product → CartItems (one-to-many)
- Product ↔ Files (many-to-many via product_files)
- Cart → CartItems (one-to-many)

## Indexes

Indexes added for commonly queried fields:
- `carts.userId`
- `cart_items.cartId`, `cart_items.productId`
- `orders.userId`, `orders.status`, `orders.createdDate`
- `order_items.orderId`, `order_items.productId`
- `product_files.productId`, `product_files.fileId`

## Usage

Import tables and types:

```typescript
import {
  users, products, orders, carts,
  type User, type Product, type Order
} from '@/app/db/schema';
import { db } from '@/app/db/drizzle';
import { eq } from 'drizzle-orm';

// Query examples
const allUsers = await db.select().from(users);
const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
```

## Migrations

Generate migrations: `npm run db:generate`
Push to database: `npm run db:push`
Open Drizzle Studio: `npm run db:studio`
```

**Step 2: Commit documentation**

```bash
git add docs/ecommerce/schema-implementation.md
git commit -m "docs: add e-commerce schema implementation documentation"
```

---

## Final Verification Checklist

Before pushing and creating PR, verify:

- [ ] All TypeScript files compile without errors: `cd x-app && npm run build`
- [ ] Schema exports all required tables and types
- [ ] Migration files generated successfully
- [ ] Naming conventions consistent (camelCase → snake_case)
- [ ] All foreign keys defined with proper onDelete behavior
- [ ] Indexes added for performance
- [ ] Relations defined for type-safe queries
- [ ] Documentation created and accurate

---

## Notes

- **Consistency**: All timestamps use `createdDate` and `updatedDate` (not `createdAt`/`updatedAt`) to match ERD
- **UUIDs**: All primary keys use UUID v4 with `defaultRandom()` except the existing `todos` table
- **Decimals**: All monetary values use `DECIMAL(10,2)` for precision
- **Cascading**: Cart items cascade delete with cart; order items cascade with orders
- **Restrictions**: Product deletions restricted when referenced in orders/cart items (data integrity)
