# E-Commerce Drizzle Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the ERD specification from `docs/ecommerce/erd.md` into a complete Drizzle ORM schema with consistent naming conventions, proper relationships, and type safety.

**Architecture:** Replace the existing simple todos schema with a comprehensive e-commerce schema including users, products, carts, orders, and file management. Using Drizzle ORM with PostgreSQL, implementing proper foreign key relationships, indexes, and constraints.

**Tech Stack:** Drizzle ORM (v0.38.2), PostgreSQL, TypeScript, drizzle-kit (v0.30.1)

---

## Task 1: Backup and Clean Existing Schema

**Files:**
- Read: `x-app/app/db/schema.ts`
- Modify: `x-app/app/db/schema.ts`

**Step 1: Review current schema**

Run: `cat x-app/app/db/schema.ts`
Expected: See the existing todos table definition

**Step 2: Comment out existing schema**

Add a comment block at the top explaining this is being replaced:

```typescript
// DEPRECATED: Original todos schema
// Replaced with comprehensive e-commerce schema on 2025-11-11
// Original schema preserved below for reference:
/*
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  content: varchar('content', { length: 255 }).notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
*/
```

**Step 3: Commit the backup**

```bash
git add x-app/app/db/schema.ts
git commit -m "docs: preserve original todos schema before e-commerce migration"
```

---

## Task 2: Define User Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add required Drizzle imports**

At the top of the file, replace/update imports:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
```

**Step 2: Define user role enum**

After imports, add:

```typescript
// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'customer']);
```

**Step 3: Define user table**

```typescript
// User table
export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 4: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 5: Commit user table**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add user table with role enum to e-commerce schema"
```

---

## Task 3: Define Product Table Schema

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add numeric import**

Update imports to include:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  numeric,
  text,
} from 'drizzle-orm/pg-core';
```

**Step 2: Define product table**

After the user table:

```typescript
// Product table
export const product = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 3: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit product table**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add product table to e-commerce schema"
```

---

## Task 4: Define Cart and CartItem Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add integer import**

Update imports to include:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  numeric,
  text,
  integer,
} from 'drizzle-orm/pg-core';
```

**Step 2: Define cart table**

After the product table:

```typescript
// Cart table
export const cart = pgTable('cart', {
  id: uuid('id').primaryKey().defaultRandom(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 3: Define cartItem table with foreign keys**

After the cart table:

```typescript
// CartItem table
export const cartItem = pgTable('cart_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  cartId: uuid('cart_id').notNull().references(() => cart.id, { onDelete: 'cascade' }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 4: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 5: Commit cart tables**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add cart and cartItem tables with foreign key relationships"
```

---

## Task 5: Define Order and OrderItem Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Define order status enums**

After the userRoleEnum:

```typescript
export const orderStatusEnum = pgEnum('order_status', ['new', 'processing', 'cancelled', 'shipped']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'paid', 'refunded']);
```

**Step 2: Define order table**

After cartItem table:

```typescript
// Order table
export const order = pgTable('order', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: orderStatusEnum('status').notNull().default('new'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 3: Define orderItem table**

After order table:

```typescript
// OrderItem table
export const orderItem = pgTable('order_item', {
  id: uuid('id').notNull().unique().defaultRandom(),
  quantity: integer('quantity').notNull().default(1),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'restrict' }),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 4: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 5: Commit order tables**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add order and orderItem tables with status enums"
```

---

## Task 6: Define File Table and Product-File Relationship

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Define file table**

After orderItem table:

```typescript
// File table
export const file = pgTable('file', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 2: Define product-file junction table**

After file table:

```typescript
// ProductFile junction table (many-to-many relationship)
export const productFile = pgTable('product_file', {
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id').notNull().references(() => file.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 3: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit file tables**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add file table and product-file junction table"
```

---

## Task 7: Add Missing Cart-User Relationship

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Update cart table to include userId**

Modify the cart table definition to add userId foreign key:

```typescript
// Cart table
export const cart = pgTable('cart', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdDate: timestamp('created_date', { mode: 'date' }).defaultNow().notNull(),
  updatedDate: timestamp('updated_date', { mode: 'date' }).defaultNow().notNull(),
});
```

**Step 2: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit cart-user relationship**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add userId foreign key to cart table"
```

---

## Task 8: Add Schema Relationships for Type Safety

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add relations import**

Update imports:

```typescript
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  numeric,
  text,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
```

**Step 2: Define user relations**

At the end of the file:

```typescript
// Relations
export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
  carts: many(cart),
}));

export const productRelations = relations(product, ({ many }) => ({
  orderItems: many(orderItem),
  cartItems: many(cartItem),
  productFiles: many(productFile),
}));

export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, {
    fields: [cart.userId],
    references: [user.id],
  }),
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
```

**Step 3: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 4: Commit relations**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat: add Drizzle relations for type-safe queries"
```

---

## Task 9: Generate and Review Migration Files

**Files:**
- Create: `x-app/app/db/migrations/*` (auto-generated)

**Step 1: Generate migration files**

Run: `cd x-app && npm run db:generate`
Expected: Migration files created in `x-app/app/db/migrations/`

**Step 2: Review generated SQL**

Run: `cat x-app/app/db/migrations/*_*.sql | head -100`
Expected: See CREATE TABLE statements with proper foreign keys and constraints

**Step 3: Commit migrations**

```bash
git add x-app/app/db/migrations/
git commit -m "chore: generate Drizzle migrations for e-commerce schema"
```

---

## Task 10: Create Schema Documentation

**Files:**
- Create: `docs/ecommerce/schema-implementation.md`

**Step 1: Write schema documentation**

```markdown
# E-Commerce Schema Implementation

## Overview
This document describes the Drizzle ORM implementation of the e-commerce database schema defined in `erd.md`.

## Tables

### user
- **Primary Key**: `id` (UUID)
- **Fields**: firstName, lastName, role (enum: admin/user/customer)
- **Relationships**: Has many orders, has many carts

### product
- **Primary Key**: `id` (UUID)
- **Fields**: name, description, price (numeric)
- **Relationships**: Has many orderItems, has many cartItems, has many files (through productFile)

### cart
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: userId → user.id
- **Fields**: amount (numeric)
- **Relationships**: Belongs to user, has many cartItems

### cartItem
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: productId → product.id, cartId → cart.id
- **Fields**: price, quantity, totalPrice
- **Relationships**: Belongs to cart, belongs to product

### order
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: userId → user.id
- **Fields**: status (enum), paymentStatus (enum), amount
- **Relationships**: Belongs to user, has many orderItems

### orderItem
- **Primary Key**: None (has unique id)
- **Foreign Keys**: productId → product.id, orderId → order.id
- **Fields**: quantity, price
- **Relationships**: Belongs to order, belongs to product

### file
- **Primary Key**: `id` (UUID)
- **Fields**: name, url
- **Relationships**: Has many products (through productFile)

### productFile
- **Composite Key**: productId, fileId
- **Foreign Keys**: productId → product.id, fileId → file.id
- **Purpose**: Junction table for many-to-many relationship

## Naming Conventions
- Tables: singular form (user, product, order)
- Foreign keys: camelCase with 'Id' suffix (userId, productId)
- Junction tables: concatenated names (productFile)
- Dates: camelCase with 'Date' suffix (createdDate, updatedDate)
- Enums: camelCase with 'Enum' suffix (userRoleEnum, orderStatusEnum)

## Migration Commands
- Generate: `npm run db:generate`
- Push to DB: `npm run db:push`
- Studio: `npm run db:studio`

## Implementation Date
2025-11-11

## References
- ERD: `docs/ecommerce/erd.md`
- Schema file: `x-app/app/db/schema.ts`
- Drizzle config: `x-app/drizzle.config.ts`
```

**Step 2: Commit documentation**

```bash
git add docs/ecommerce/schema-implementation.md
git commit -m "docs: add e-commerce schema implementation documentation"
```

---

## Task 11: Create Type Exports for Application Use

**Files:**
- Create: `x-app/app/db/types.ts`

**Step 1: Create types file**

```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  user,
  product,
  cart,
  cartItem,
  order,
  orderItem,
  file,
  productFile,
} from './schema';

// Select types (for reading from DB)
export type User = InferSelectModel<typeof user>;
export type Product = InferSelectModel<typeof product>;
export type Cart = InferSelectModel<typeof cart>;
export type CartItem = InferSelectModel<typeof cartItem>;
export type Order = InferSelectModel<typeof order>;
export type OrderItem = InferSelectModel<typeof orderItem>;
export type File = InferSelectModel<typeof file>;
export type ProductFile = InferSelectModel<typeof productFile>;

// Insert types (for writing to DB)
export type NewUser = InferInsertModel<typeof user>;
export type NewProduct = InferInsertModel<typeof product>;
export type NewCart = InferInsertModel<typeof cart>;
export type NewCartItem = InferInsertModel<typeof cartItem>;
export type NewOrder = InferInsertModel<typeof order>;
export type NewOrderItem = InferInsertModel<typeof orderItem>;
export type NewFile = InferInsertModel<typeof file>;
export type NewProductFile = InferInsertModel<typeof productFile>;
```

**Step 2: Verify syntax**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit types**

```bash
git add x-app/app/db/types.ts
git commit -m "feat: add TypeScript type exports for schema models"
```

---

## Task 12: Final Verification and Testing

**Files:**
- Read: `x-app/app/db/schema.ts`
- Read: `x-app/drizzle.config.ts`

**Step 1: Run full TypeScript check**

Run: `cd x-app && npx tsc --noEmit`
Expected: No type errors

**Step 2: Verify schema file completeness**

Run: `grep -E "(export const|export type)" x-app/app/db/schema.ts | wc -l`
Expected: At least 16 exports (8 tables + 8 relations)

**Step 3: Check migration files exist**

Run: `ls -la x-app/app/db/migrations/`
Expected: At least one .sql file

**Step 4: Review all committed changes**

Run: `git log --oneline --graph -n 15`
Expected: See all 11+ commits for this implementation

**Step 5: Create final summary commit**

```bash
git add -A
git commit -m "feat: complete e-commerce Drizzle schema implementation

- Replaced todos schema with comprehensive e-commerce schema
- Implemented 8 core tables: user, product, cart, cartItem, order, orderItem, file, productFile
- Added 3 enums: userRole, orderStatus, paymentStatus
- Configured foreign key relationships with appropriate cascade/restrict rules
- Created type-safe relations for Drizzle queries
- Generated migrations and TypeScript types
- Added comprehensive documentation

Refs: docs/ecommerce/erd.md"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] All 8 tables match the ERD specification
- [ ] Foreign key relationships use correct cascade/restrict rules
- [ ] All enums are properly defined (userRole, orderStatus, paymentStatus)
- [ ] TypeScript compilation passes with no errors
- [ ] Migration files are generated successfully
- [ ] Type exports are available for application use
- [ ] Documentation is complete and accurate
- [ ] Consistent naming conventions throughout (camelCase for fields, singular table names)
- [ ] All timestamps use `mode: 'date'` for proper Date object handling
- [ ] Numeric fields use appropriate precision (10, 2) for monetary values

---

## Notes

**Naming Consistency:**
- The ERD uses `createdDate`/`updatedDate` - maintain this convention
- Table names are singular: `user`, `product`, `order` (not users, products, orders)
- Foreign keys use camelCase: `userId`, `productId`, `orderId`
- Junction table follows pattern: `productFile` (not product_files)

**Database Considerations:**
- UUID used for all primary keys (more scalable than serial)
- Numeric type for prices (avoids floating-point precision issues)
- Appropriate cascade rules:
  - `cascade` for cart items (delete cart → delete items)
  - `restrict` for orders (prevent deletion of users/products with orders)

**Future Enhancements:**
- Add indexes for frequently queried fields (userId, productId)
- Add composite unique constraints where needed
- Consider soft deletes for critical tables
- Add check constraints for positive prices/quantities
