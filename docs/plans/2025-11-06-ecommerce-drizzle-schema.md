# E-commerce Drizzle Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the e-commerce ERD (docs/ecommerce/erd.md) to a production-ready Drizzle ORM schema with consistent naming conventions, proper relationships, and type safety.

**Architecture:** Replace the existing simple todos schema with a complete e-commerce schema including users, products, carts, orders, and file management. Use Drizzle ORM's PostgreSQL adapter with proper foreign key constraints, indexes, and timestamps. Follow consistent naming conventions (camelCase for TypeScript, snake_case for database columns).

**Tech Stack:** Drizzle ORM (v0.38.2), PostgreSQL, TypeScript, Next.js 15

---

## Task 1: Create User Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts` (replace entire file)

**Step 1: Write the user table schema**

Replace the existing schema.ts content with the user table:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'customer']);

// User table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No errors

**Step 3: Generate migration**

Run: `cd x-app && pnpm db:generate`
Expected: Migration file created in `x-app/app/db/migrations/`

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts x-app/app/db/migrations/
git commit -m "feat: add users table schema with role enum"
```

---

## Task 2: Create Product and File Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add product and file tables**

Add these tables to schema.ts after the users table:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ... existing user table code ...

// Product table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// File table
export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  product: one(products, {
    fields: [files.productId],
    references: [products.id],
  }),
}));
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No errors

**Step 3: Generate migration**

Run: `cd x-app && pnpm db:generate`
Expected: New migration file created with products and files tables

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts x-app/app/db/migrations/
git commit -m "feat: add products and files tables with relations"
```

---

## Task 3: Create Cart and Cart Items Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add cart and cartItems tables**

Add these tables to schema.ts:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ... existing tables ...

// Cart table
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Cart Item table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Add to existing relations or create new ones
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

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

// Update products relations to include cartItems
export const productsRelations = relations(products, ({ many }) => ({
  files: many(files),
  cartItems: many(cartItems),
}));
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No errors

**Step 3: Generate migration**

Run: `cd x-app && pnpm db:generate`
Expected: New migration file created

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts x-app/app/db/migrations/
git commit -m "feat: add carts and cart items tables with relations"
```

---

## Task 4: Create Order and Order Items Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add order status and payment status enums**

Add these enums at the top of schema.ts with other enums:

```typescript
export const orderStatusEnum = pgEnum('order_status', ['new', 'processing', 'cancelled', 'shipped']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'paid', 'refunded']);
```

**Step 2: Add orders and orderItems tables**

Add these tables to schema.ts:

```typescript
// Order table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').notNull().default('new'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Order Item table
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

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

// Update users relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  carts: many(carts),
}));

// Update products relations to include orderItems
export const productsRelations = relations(products, ({ many }) => ({
  files: many(files),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));
```

**Step 3: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No errors

**Step 4: Generate migration**

Run: `cd x-app && pnpm db:generate`
Expected: New migration file created

**Step 5: Commit**

```bash
git add x-app/app/db/schema.ts x-app/app/db/migrations/
git commit -m "feat: add orders and order items tables with status enums"
```

---

## Task 5: Create Complete Schema with All Relations

**Files:**
- Modify: `x-app/app/db/schema.ts` (final cleanup and organization)

**Step 1: Organize the complete schema file**

Ensure the schema.ts file is well-organized with this structure:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// ENUMS
// ============================================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'customer']);
export const orderStatusEnum = pgEnum('order_status', ['new', 'processing', 'cancelled', 'shipped']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'paid', 'refunded']);

// ============================================================
// TABLES
// ============================================================

// User table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Product table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// File table
export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Cart table
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Cart Item table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Order table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').notNull().default('new'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Order Item table
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  carts: many(carts),
}));

export const productsRelations = relations(products, ({ many }) => ({
  files: many(files),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const filesRelations = relations(files, ({ one }) => ({
  product: one(products, {
    fields: [files.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

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

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

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

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No errors

**Step 3: Generate final migration**

Run: `cd x-app && pnpm db:generate`
Expected: Migration files are up to date or new migration created

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts x-app/app/db/migrations/
git commit -m "refactor: organize schema with clear sections and all relations"
```

---

## Task 6: Add Type Exports and Inference Helpers

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add TypeScript type exports**

Add these type exports at the end of schema.ts:

```typescript
// ============================================================
// TYPE EXPORTS
// ============================================================

// Inferred types for insert operations
export type InsertUser = typeof users.$inferInsert;
export type InsertProduct = typeof products.$inferInsert;
export type InsertFile = typeof files.$inferInsert;
export type InsertCart = typeof carts.$inferInsert;
export type InsertCartItem = typeof cartItems.$inferInsert;
export type InsertOrder = typeof orders.$inferInsert;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Inferred types for select operations
export type SelectUser = typeof users.$inferSelect;
export type SelectProduct = typeof products.$inferSelect;
export type SelectFile = typeof files.$inferSelect;
export type SelectCart = typeof carts.$inferSelect;
export type SelectCartItem = typeof cartItems.$inferSelect;
export type SelectOrder = typeof orders.$inferSelect;
export type SelectOrderItem = typeof orderItems.$inferSelect;
```

**Step 2: Verify TypeScript compilation**

Run: `cd x-app && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add TypeScript type exports for all tables"
```

---

## Task 7: Update Database Actions (Optional Cleanup)

**Files:**
- Check: `x-app/app/db/actions.ts`

**Step 1: Review existing actions file**

Run: `cat x-app/app/db/actions.ts`
Expected: May contain old todo-related actions

**Step 2: Document recommended updates**

Create a comment block at the top of actions.ts:

```typescript
/**
 * Database Actions
 *
 * TODO: Update actions to work with new e-commerce schema:
 * - Remove todo-related actions
 * - Add CRUD operations for users, products, carts, orders
 * - Add helper functions for cart calculations
 * - Add helper functions for order processing
 */
```

**Step 3: Commit**

```bash
git add x-app/app/db/actions.ts
git commit -m "docs: add TODO for updating database actions"
```

---

## Task 8: Documentation and Validation

**Files:**
- Create: `docs/ecommerce/schema-implementation.md`

**Step 1: Create implementation documentation**

```markdown
# E-commerce Schema Implementation

## Overview

This document describes the Drizzle ORM schema implementation based on the ERD in `docs/ecommerce/erd.md`.

## Schema Structure

### Tables

1. **users** - Customer and admin accounts
2. **products** - Product catalog
3. **files** - Product images and attachments
4. **carts** - Shopping carts
5. **cart_items** - Items in shopping carts
6. **orders** - Customer orders
7. **order_items** - Items in orders

### Naming Conventions

- **TypeScript**: camelCase for variables and properties
- **Database**: snake_case for table and column names
- **Tables**: plural form (users, products, orders)
- **Enums**: descriptive names with Enum suffix (userRoleEnum)

### Key Decisions

1. **UUID Primary Keys**: Using UUID v4 for all primary keys for better distribution and security
2. **Numeric for Money**: Using `numeric(10, 2)` for all monetary values to avoid floating-point issues
3. **Cascade Deletes**:
   - Cart items deleted when cart is deleted
   - Order items deleted when order is deleted
   - Files deleted when product is deleted
4. **Set Null on Delete**:
   - Orders kept when user is deleted (userId set to null)
   - Order items kept when product is deleted (productId set to null)

## Usage Examples

### Insert a User

```typescript
import { db } from './drizzle';
import { users, InsertUser } from './schema';

const newUser: InsertUser = {
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer',
};

await db.insert(users).values(newUser);
```

### Query Products with Files

```typescript
import { db } from './drizzle';
import { products } from './schema';

const productsWithFiles = await db.query.products.findMany({
  with: {
    files: true,
  },
});
```

### Query Orders with Items and Products

```typescript
import { db } from './drizzle';
import { orders } from './schema';

const orderDetails = await db.query.orders.findFirst({
  where: (orders, { eq }) => eq(orders.id, orderId),
  with: {
    user: true,
    items: {
      with: {
        product: true,
      },
    },
  },
});
```

## Migration Commands

```bash
# Generate migration
pnpm db:generate

# Push to database
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

## Testing the Schema

1. Push schema to database: `pnpm db:push`
2. Open Drizzle Studio: `pnpm db:studio`
3. Verify all tables are created
4. Test relationships by inserting sample data
5. Verify cascade deletes work as expected

## References

- ERD: `docs/ecommerce/erd.md`
- Schema: `x-app/app/db/schema.ts`
- Drizzle Config: `x-app/drizzle.config.ts`
```

**Step 2: Create the documentation file**

Run: `mkdir -p docs/ecommerce && cat > docs/ecommerce/schema-implementation.md`
(Paste the content above)

**Step 3: Commit**

```bash
git add docs/ecommerce/schema-implementation.md
git commit -m "docs: add schema implementation documentation"
```

---

## Task 9: Verify Complete Implementation

**Files:**
- All schema and documentation files

**Step 1: Run type check**

Run: `cd x-app && npx tsc --noEmit`
Expected: No errors

**Step 2: Generate migrations**

Run: `cd x-app && pnpm db:generate`
Expected: All migrations generated successfully

**Step 3: Review generated SQL**

Run: `ls -la x-app/app/db/migrations/`
Expected: See migration files with timestamps

**Step 4: Verify schema exports**

Run: `cd x-app && node -e "const schema = require('./app/db/schema.ts'); console.log(Object.keys(schema));"`
Expected: See all exported tables, relations, and types

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: verify complete e-commerce schema implementation"
```

---

## Summary

This plan converts the ERD from `docs/ecommerce/erd.md` into a complete Drizzle ORM schema following these principles:

✅ **Consistent Naming**: camelCase in TypeScript, snake_case in database
✅ **Type Safety**: Full TypeScript inference with Insert/Select types
✅ **Proper Relations**: Drizzle relations for easy querying
✅ **Data Integrity**: Foreign keys with appropriate cascade/set null behavior
✅ **Best Practices**: UUID primary keys, numeric for money, timestamps on all tables
✅ **Documentation**: Clear comments and separate documentation file
✅ **DRY**: Reusable type exports
✅ **YAGNI**: Only what's in the ERD, nothing extra

The implementation is production-ready and follows Drizzle ORM best practices.
