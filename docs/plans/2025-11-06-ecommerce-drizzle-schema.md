# E-commerce Drizzle Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the e-commerce ERD (docs/ecommerce/erd.md) to a production-ready Drizzle ORM schema with consistent naming conventions, proper relationships, and type safety.

**Architecture:** Replace the existing simple todos schema with a complete e-commerce schema including users, products, carts, orders, and file management. Use Drizzle ORM's PostgreSQL adapter with proper foreign key constraints, indexes, and timestamps. Follow the ERD naming conventions exactly (camelCase for all field names).

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
export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('firstName', { length: 255 }).notNull(),
  lastName: varchar('lastName', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
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
git commit -m "feat: add user table schema with role enum"
```

---

## Task 2: Create Product and File Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add product and file tables**

Add these tables to schema.ts after the user table:

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
export const product = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// File table
export const file = pgTable('file', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  productId: uuid('productId').references(() => product.id, { onDelete: 'cascade' }),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Relations
export const productRelations = relations(product, ({ many }) => ({
  files: many(file),
}));

export const fileRelations = relations(file, ({ one }) => ({
  product: one(product, {
    fields: [file.productId],
    references: [product.id],
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
git commit -m "feat: add product and file tables with relations"
```

---

## Task 3: Create Cart and Cart Items Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add cart and cartItem tables**

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
export const cart = pgTable('cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Cart Item table
export const cartItem = pgTable('cartItem', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: varchar('productId', { length: 255 }).notNull(), // FK to product
  price: varchar('price', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  totalPrice: numeric('totalPrice', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Add to existing relations or create new ones
export const cartRelations = relations(cart, ({ many }) => ({
  items: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart),
  product: one(product, {
    fields: [cartItem.productId],
    references: [product.id],
  }),
}));

// Update product relations to include cartItems
export const productRelations = relations(product, ({ many }) => ({
  files: many(file),
  cartItems: many(cartItem),
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
git commit -m "feat: add cart and cart item tables with relations"
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

**Step 2: Add order and orderItem tables**

Add these tables to schema.ts:

```typescript
// Order table
export const order = pgTable('order', {
  id: uuid('id').defaultRandom().primaryKey(),
  status: orderStatusEnum('status').notNull().default('new'),
  paymentStatus: paymentStatusEnum('paymentStatus').notNull().default('unpaid'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  userId: varchar('userId', { length: 255 }),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Order Item table
export const orderItem = pgTable('orderItem', {
  id: uuid('id').primaryKey(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  productId: varchar('productId', { length: 255 }).notNull(), // FK
  orderId: varchar('orderId', { length: 255 }).notNull(), // FK
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Relations
export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  items: many(orderItem),
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

// Update user relations
export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
}));

// Update product relations to include orderItems
export const productRelations = relations(product, ({ many }) => ({
  files: many(file),
  cartItems: many(cartItem),
  orderItems: many(orderItem),
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
git commit -m "feat: add order and order item tables with status enums"
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
export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('firstName', { length: 255 }).notNull(),
  lastName: varchar('lastName', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Product table
export const product = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// File table
export const file = pgTable('file', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  productId: uuid('productId').references(() => product.id, { onDelete: 'cascade' }),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Cart table
export const cart = pgTable('cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Cart Item table
export const cartItem = pgTable('cartItem', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: varchar('productId', { length: 255 }).notNull(),
  price: varchar('price', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  totalPrice: numeric('totalPrice', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Order table
export const order = pgTable('order', {
  id: uuid('id').defaultRandom().primaryKey(),
  status: orderStatusEnum('status').notNull().default('new'),
  paymentStatus: paymentStatusEnum('paymentStatus').notNull().default('unpaid'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  userId: varchar('userId', { length: 255 }),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// Order Item table
export const orderItem = pgTable('orderItem', {
  id: uuid('id').primaryKey(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  productId: varchar('productId', { length: 255 }).notNull(),
  orderId: varchar('orderId', { length: 255 }).notNull(),
  createdDate: timestamp('createdDate').defaultNow().notNull(),
  updatedDate: timestamp('updatedDate').defaultNow().notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
}));

export const productRelations = relations(product, ({ many }) => ({
  files: many(file),
  cartItems: many(cartItem),
  orderItems: many(orderItem),
}));

export const fileRelations = relations(file, ({ one }) => ({
  product: one(product, {
    fields: [file.productId],
    references: [product.id],
  }),
}));

export const cartRelations = relations(cart, ({ many }) => ({
  items: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart),
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
  items: many(orderItem),
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
export type InsertUser = typeof user.$inferInsert;
export type InsertProduct = typeof product.$inferInsert;
export type InsertFile = typeof file.$inferInsert;
export type InsertCart = typeof cart.$inferInsert;
export type InsertCartItem = typeof cartItem.$inferInsert;
export type InsertOrder = typeof order.$inferInsert;
export type InsertOrderItem = typeof orderItem.$inferInsert;

// Inferred types for select operations
export type SelectUser = typeof user.$inferSelect;
export type SelectProduct = typeof product.$inferSelect;
export type SelectFile = typeof file.$inferSelect;
export type SelectCart = typeof cart.$inferSelect;
export type SelectCartItem = typeof cartItem.$inferSelect;
export type SelectOrder = typeof order.$inferSelect;
export type SelectOrderItem = typeof orderItem.$inferSelect;
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

1. **user** - Customer and admin accounts
2. **product** - Product catalog
3. **file** - Product images and attachments
4. **cart** - Shopping carts
5. **cartItem** - Items in shopping carts
6. **order** - Customer orders
7. **orderItem** - Items in orders

### Naming Conventions

- **TypeScript**: camelCase for variables, properties, and table exports
- **Database**: camelCase for table and column names (matching ERD exactly)
- **Tables**: singular form (user, product, order)
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
import { user, InsertUser } from './schema';

const newUser: InsertUser = {
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer',
};

await db.insert(user).values(newUser);
```

### Query Products with Files

```typescript
import { db } from './drizzle';
import { product } from './schema';

const productsWithFiles = await db.query.product.findMany({
  with: {
    files: true,
  },
});
```

### Query Orders with Items and Products

```typescript
import { db } from './drizzle';
import { order } from './schema';

const orderDetails = await db.query.order.findFirst({
  where: (order, { eq }) => eq(order.id, orderId),
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

✅ **Consistent Naming**: camelCase throughout, matching ERD exactly
✅ **Type Safety**: Full TypeScript inference with Insert/Select types
✅ **Proper Relations**: Drizzle relations for easy querying
✅ **Data Integrity**: Foreign keys with appropriate cascade/set null behavior
✅ **Best Practices**: UUID primary keys, numeric for money, timestamps on all tables
✅ **Documentation**: Clear comments and separate documentation file
✅ **DRY**: Reusable type exports
✅ **YAGNI**: Only what's in the ERD, nothing extra

The implementation is production-ready and follows Drizzle ORM best practices while maintaining exact naming consistency with the source ERD.
