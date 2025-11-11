# E-commerce Database Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create comprehensive database schema for e-commerce system supporting products, orders, carts, users, promotions, and inventory management.

**Architecture:** Using Drizzle ORM with PostgreSQL, following the existing pattern in `/app/db/`. All tables will be defined with proper relationships, indexes, and constraints. Schema supports multi-warehouse inventory, flexible promotion system, and order lifecycle management.

**Tech Stack:** Drizzle ORM, PostgreSQL, TypeScript, Next.js 15

---

## Task 1: Core Database Schema - User & Category Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Remove existing todos table and import UUID**

```typescript
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
  numeric,
  json,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
```

**Step 2: Create user table with role-based access**

```typescript
export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // admin/user/customer
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Create category table**

```typescript
export const category = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat(db): add user and category tables"
```

---

## Task 2: Product, File & Inventory Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Create file table for product images**

```typescript
export const file = pgTable('file', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  productId: uuid('product_id').references(() => product.id, { onDelete: 'cascade' }),
  blogId: uuid('blog_id').references(() => blog.id, { onDelete: 'cascade' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Create product table**

```typescript
export const product = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid('category_id').references(() => category.id, { onDelete: 'set null' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Create warehouse and inventory tables**

```typescript
export const warehouse = pgTable('warehouse', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouse.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
});
```

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat(db): add product, file, warehouse and inventory tables"
```

---

## Task 3: Cart & Cart Item Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Create cart table**

```typescript
export const cart = pgTable('cart', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }), // for anonymous users
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Create cart item table**

```typescript
export const cartItem = pgTable('cart_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').notNull().references(() => cart.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat(db): add cart and cart_item tables"
```

---

## Task 4: Order, Order Item & Transaction Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Create order table with status workflow**

```typescript
export const order = pgTable('order', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).notNull().default('new'), // new/processing/cancelled/shipped
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('unpaid'), // unpaid/paid/refunded
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 2: Create order item table**

```typescript
export const orderItem = pgTable('order_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});
```

**Step 3: Create transaction table for payment tracking**

```typescript
export const transaction = pgTable('transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('processing'), // processing/success/failed
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat(db): add order, order_item and transaction tables"
```

---

## Task 5: Promotion, Coupon & Promotion Application Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Create promotion table**

```typescript
export const promotion = pgTable('promotion', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  active: boolean('active').notNull().default(true),
  type: varchar('type', { length: 20 }).notNull(), // percentage/fixedAmount/freeShipping
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  autoApply: boolean('auto_apply').notNull().default(false),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 2: Create promotion condition table**

```typescript
export const promotionCondition = pgTable('promotion_condition', {
  id: uuid('id').primaryKey().defaultRandom(),
  promotionId: uuid('promotion_id').notNull().references(() => promotion.id, { onDelete: 'cascade' }),
  conditionType: varchar('condition_type', { length: 50 }).notNull(), // minCartTotal/specificProducts/specificCategories/customerGroup/firstOrder
  conditionValue: json('condition_value').notNull(), // flexible JSON for different condition types
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 3: Create coupon table**

```typescript
export const coupon = pgTable('coupon', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  promotionId: uuid('promotion_id').references(() => promotion.id, { onDelete: 'cascade' }),
  usageLimit: integer('usage_limit'),
  usageLimitPerUser: integer('usage_limit_per_user'),
  usedCount: integer('used_count').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 4: Create coupon user tracking and promotion application tables**

```typescript
export const couponUser = pgTable('coupon_user', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  couponId: uuid('coupon_id').notNull().references(() => coupon.id, { onDelete: 'cascade' }),
  usedCount: integer('used_count').notNull().default(0),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});

export const promotionApplication = pgTable('promotion_application', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  couponId: uuid('coupon_id').references(() => coupon.id, { onDelete: 'set null' }),
  promotionId: uuid('promotion_id').notNull().references(() => promotion.id, { onDelete: 'cascade' }),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 5: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat(db): add promotion, coupon and related tables"
```

---

## Task 6: Review, Refund Request & Blog Tables

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Create review table**

```typescript
export const review = pgTable('review', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 2: Create refund request table**

```typescript
export const refundRequest = pgTable('refund_request', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
  approverId: uuid('approver_id').references(() => user.id, { onDelete: 'set null' }),
  reason: text('reason'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending/approved/rejected
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 3: Create blog and comment tables**

```typescript
export const blog = pgTable('blog', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  thumbnailId: uuid('thumbnail_id').references(() => file.id, { onDelete: 'set null' }),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

export const comment = pgTable('comment', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogId: uuid('blog_id').notNull().references(() => blog.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
});
```

**Step 4: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat(db): add review, refund_request, blog and comment tables"
```

---

## Task 7: Define Drizzle ORM Relations

**Files:**
- Modify: `x-app/app/db/schema.ts`

**Step 1: Add user relations**

```typescript
export const userRelations = relations(user, ({ many }) => ({
  carts: many(cart),
  orders: many(order),
  reviews: many(review),
  comments: many(comment),
  blogs: many(blog),
  refundRequests: many(refundRequest),
  couponUsers: many(couponUser),
}));
```

**Step 2: Add product relations**

```typescript
export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  files: many(file),
  cartItems: many(cartItem),
  orderItems: many(orderItem),
  inventories: many(inventory),
  reviews: many(review),
}));
```

**Step 3: Add category relations**

```typescript
export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));
```

**Step 4: Add cart and order relations**

```typescript
export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, {
    fields: [cart.userId],
    references: [user.id],
  }),
  items: many(cartItem),
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
  items: many(orderItem),
  transactions: many(transaction),
  reviews: many(review),
  refundRequests: many(refundRequest),
  promotionApplications: many(promotionApplication),
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

**Step 5: Add promotion and coupon relations**

```typescript
export const promotionRelations = relations(promotion, ({ many }) => ({
  conditions: many(promotionCondition),
  coupons: many(coupon),
  applications: many(promotionApplication),
}));

export const promotionConditionRelations = relations(promotionCondition, ({ one }) => ({
  promotion: one(promotion, {
    fields: [promotionCondition.promotionId],
    references: [promotion.id],
  }),
}));

export const couponRelations = relations(coupon, ({ one, many }) => ({
  promotion: one(promotion, {
    fields: [coupon.promotionId],
    references: [promotion.id],
  }),
  couponUsers: many(couponUser),
  promotionApplications: many(promotionApplication),
}));

export const couponUserRelations = relations(couponUser, ({ one }) => ({
  user: one(user, {
    fields: [couponUser.userId],
    references: [user.id],
  }),
  coupon: one(coupon, {
    fields: [couponUser.couponId],
    references: [coupon.id],
  }),
}));
```

**Step 6: Commit**

```bash
git add x-app/app/db/schema.ts
git commit -m "feat(db): add drizzle orm relations for all tables"
```

---

## Task 8: Generate and Push Database Migrations

**Files:**
- Generate: `x-app/drizzle/**/*.sql`

**Step 1: Generate migration files**

Run: `cd x-app && bun run db:generate`
Expected: Migration files created in `drizzle/` directory

**Step 2: Review generated migration**

Run: `cat x-app/drizzle/meta/_journal.json`
Expected: See migration entry with timestamp

**Step 3: Push schema to database**

Run: `cd x-app && bun run db:push`
Expected: All tables created successfully

**Step 4: Verify tables in database**

Run: `cd x-app && bun run db:studio`
Expected: Drizzle Studio opens, all 20+ tables visible

**Step 5: Commit migrations**

```bash
git add x-app/drizzle/
git commit -m "chore(db): add migrations for ecommerce schema"
```

---

## Task 9: Create Database Seed Script

**Files:**
- Create: `x-app/app/db/seed.ts`

**Step 1: Create seed file with imports**

```typescript
import { db } from './drizzle';
import {
  user,
  category,
  product,
  warehouse,
  inventory,
  promotion,
  coupon,
} from './schema';

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await db.delete(user);
  await db.delete(category);
  await db.delete(product);
  await db.delete(warehouse);

  console.log('Database seeding complete!');
}

seed().catch(console.error);
```

**Step 2: Add admin and customer users**

```typescript
  // Create users
  const [admin] = await db.insert(user).values([
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'admin',
    },
    {
      firstName: 'John',
      lastName: 'Customer',
      email: 'customer@example.com',
      role: 'customer',
    },
  ]).returning();

  console.log('Created users');
```

**Step 3: Add categories and products**

```typescript
  // Create categories
  const [electronics, clothing] = await db.insert(category).values([
    { name: 'Electronics' },
    { name: 'Clothing' },
  ]).returning();

  console.log('Created categories');

  // Create products
  const products = await db.insert(product).values([
    {
      name: 'Laptop',
      description: 'High-performance laptop',
      price: '999.99',
      categoryId: electronics.id,
    },
    {
      name: 'T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: '19.99',
      categoryId: clothing.id,
    },
  ]).returning();

  console.log('Created products');
```

**Step 4: Add warehouse and inventory**

```typescript
  // Create warehouse
  const [mainWarehouse] = await db.insert(warehouse).values({
    name: 'Main Warehouse',
    address: '123 Main St, City, State 12345',
  }).returning();

  console.log('Created warehouse');

  // Add inventory
  await db.insert(inventory).values(
    products.map(p => ({
      productId: p.id,
      warehouseId: mainWarehouse.id,
      quantity: 100,
    }))
  );

  console.log('Created inventory');
```

**Step 5: Add sample promotion and coupon**

```typescript
  // Create promotion
  const [promo] = await db.insert(promotion).values({
    name: '10% Off First Order',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    active: true,
    type: 'percentage',
    value: '10',
    autoApply: false,
  }).returning();

  console.log('Created promotion');

  // Create coupon
  await db.insert(coupon).values({
    code: 'FIRST10',
    promotionId: promo.id,
    usageLimit: 100,
    usageLimitPerUser: 1,
    active: true,
  });

  console.log('Created coupon');
```

**Step 6: Add seed script to package.json**

Modify `x-app/package.json`:
```json
{
  "scripts": {
    "db:seed": "bun run app/db/seed.ts"
  }
}
```

**Step 7: Run seed script**

Run: `cd x-app && bun run db:seed`
Expected: "Database seeding complete!" message

**Step 8: Verify in Drizzle Studio**

Run: `cd x-app && bun run db:studio`
Expected: See seeded data in all tables

**Step 9: Commit**

```bash
git add x-app/app/db/seed.ts x-app/package.json
git commit -m "feat(db): add database seed script with sample data"
```

---

## Verification Checklist

- [ ] All 20+ tables created in PostgreSQL
- [ ] Drizzle Studio shows all tables with correct columns
- [ ] Foreign key relationships work correctly
- [ ] Seed script runs without errors
- [ ] Sample data visible in Drizzle Studio
- [ ] Migration files generated and committed

---

## Next Steps

After completing this foundation:
1. Implement tRPC API routes for admin and public endpoints
2. Build admin product management UI
3. Build storefront product listing and cart
4. Implement order processing and payment flow
