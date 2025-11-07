# E-commerce Backend APIs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete REST API backend for e-commerce system with product management, cart operations, order processing, and user management.

**Architecture:** Next.js 15 App Router with route handlers (single file per API endpoint), Drizzle ORM with PostgreSQL database, following event-driven patterns from event-storming documentation. Each API endpoint is a standalone route.ts file with clear separation between admin and public APIs.

**Tech Stack:** Next.js 15, TypeScript, Drizzle ORM, PostgreSQL, OpenAPI/Swagger for documentation

---

## Task 1: Update Database Schema

**Files:**
- Modify: `x-app/app/db/schema.ts:1-15`

**Step 1: Replace existing schema with complete e-commerce schema**

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // admin/user/customer
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// File table (for product images)
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cart table
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cart Item table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).notNull().default('new'), // new/processing/cancelled/shipped
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('unpaid'), // unpaid/paid/refunded
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order Item table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Keep the old todos table for backward compatibility
export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: varchar('content', { length: 255 }).notNull(),
  completed: varchar('completed', { length: 10 }).default('false'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Step 2: Generate and apply database migrations**

Run: `cd x-app && npm run db:generate`
Expected: Migration files generated in `x-app/app/db/migrations/`

Run: `cd x-app && npm run db:push`
Expected: Database schema updated successfully

**Step 3: Commit schema changes**

```bash
git add x-app/app/db/schema.ts x-app/app/db/migrations/
git commit -m "feat: add e-commerce database schema with users, products, carts, and orders"
```

---

## Task 2: Admin Product APIs - Create Product

**Files:**
- Create: `x-app/app/api/admin/product/create/route.ts`

**Step 1: Create admin product creation endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';

/**
 * @swagger
 * /api/admin/product/create:
 *   post:
 *     tags: [Admin - Products]
 *     summary: Create a new product
 *     description: Admin endpoint to create a new product in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wireless Mouse"
 *               description:
 *                 type: string
 *                 example: "Ergonomic wireless mouse with 6 buttons"
 *               price:
 *                 type: number
 *                 example: 29.99
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const [product] = await db
      .insert(products)
      .values({
        name,
        description: description || null,
        price: price.toString(),
      })
      .returning();

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify endpoint exists**

Run: `ls x-app/app/api/admin/product/create/`
Expected: `route.ts` file exists

**Step 3: Commit product create API**

```bash
git add x-app/app/api/admin/product/create/route.ts
git commit -m "feat: add admin product create API endpoint"
```

---

## Task 3: Admin Product APIs - Get All Products

**Files:**
- Create: `x-app/app/api/admin/product/getAll/route.ts`

**Step 1: Create admin product listing endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';

/**
 * @swagger
 * /api/admin/product/getAll:
 *   get:
 *     tags: [Admin - Products]
 *     summary: Get all products
 *     description: Admin endpoint to retrieve all products in the system
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const allProducts = await db.select().from(products);

    return NextResponse.json(
      { success: true, data: allProducts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit product getAll API**

```bash
git add x-app/app/api/admin/product/getAll/route.ts
git commit -m "feat: add admin product getAll API endpoint"
```

---

## Task 4: Admin Product APIs - Update Product

**Files:**
- Create: `x-app/app/api/admin/product/update/route.ts`

**Step 1: Create admin product update endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/admin/product/update:
 *   put:
 *     tags: [Admin - Products]
 *     summary: Update a product
 *     description: Admin endpoint to update an existing product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               name:
 *                 type: string
 *                 example: "Updated Wireless Mouse"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               price:
 *                 type: number
 *                 example: 34.99
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = price.toString();

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit product update API**

```bash
git add x-app/app/api/admin/product/update/route.ts
git commit -m "feat: add admin product update API endpoint"
```

---

## Task 5: Admin Product APIs - Delete Product

**Files:**
- Create: `x-app/app/api/admin/product/delete/route.ts`

**Step 1: Create admin product delete endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/admin/product/delete:
 *   delete:
 *     tags: [Admin - Products]
 *     summary: Delete a product
 *     description: Admin endpoint to delete a product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { id: deletedProduct.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit product delete API**

```bash
git add x-app/app/api/admin/product/delete/route.ts
git commit -m "feat: add admin product delete API endpoint"
```

---

## Task 6: Public Product API - Get All Products

**Files:**
- Create: `x-app/app/api/public/product/getAll/route.ts`

**Step 1: Create public product listing endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';

/**
 * @swagger
 * /api/public/product/getAll:
 *   get:
 *     tags: [Public - Products]
 *     summary: Get all products (public)
 *     description: Public endpoint for customers to browse all available products
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const allProducts = await db.select().from(products);

    return NextResponse.json(
      { success: true, data: allProducts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit public product getAll API**

```bash
git add x-app/app/api/public/product/getAll/route.ts
git commit -m "feat: add public product getAll API endpoint"
```

---

## Task 7: Public Cart API - Add Item

**Files:**
- Create: `x-app/app/api/public/cart/addItem/route.ts`

**Step 1: Create cart add item endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { carts, cartItems, products } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * @swagger
 * /api/public/cart/addItem:
 *   post:
 *     tags: [Public - Cart]
 *     summary: Add item to cart
 *     description: Add a product to the shopping cart (creates cart if not exists)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               cartId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *               quantity:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174002"
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, productId, quantity = 1, userId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    let cart;

    // Find or create cart
    if (cartId) {
      const [existingCart] = await db
        .select()
        .from(carts)
        .where(eq(carts.id, cartId));
      cart = existingCart;
    }

    if (!cart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: userId || null,
          amount: '0',
        })
        .returning();
      cart = newCart;
    }

    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId)
        )
      );

    let cartItem;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = (parseFloat(product.price) * newQuantity).toString();

      [cartItem] = await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
    } else {
      // Create new cart item
      const totalPrice = (parseFloat(product.price) * quantity).toString();

      [cartItem] = await db
        .insert(cartItems)
        .values({
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
          totalPrice,
        })
        .returning();
    }

    // Update cart total
    const allCartItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id));

    const totalAmount = allCartItems.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice),
      0
    );

    await db
      .update(carts)
      .set({
        amount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cart.id));

    return NextResponse.json(
      {
        success: true,
        data: {
          cart: { ...cart, amount: totalAmount.toString() },
          cartItem,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit cart addItem API**

```bash
git add x-app/app/api/public/cart/addItem/route.ts
git commit -m "feat: add public cart addItem API endpoint"
```

---

## Task 8: Public Cart API - Get Items

**Files:**
- Create: `x-app/app/api/public/cart/getItems/route.ts`

**Step 1: Create cart get items endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { carts, cartItems, products } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/public/cart/getItems:
 *   get:
 *     tags: [Public - Cart]
 *     summary: Get cart items
 *     description: Retrieve all items in a cart with product details
 *     parameters:
 *       - in: query
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 *       400:
 *         description: Cart ID is required
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId));

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Get cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        price: cartItems.price,
        totalPrice: cartItems.totalPrice,
        productName: products.name,
        productDescription: products.description,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    return NextResponse.json(
      {
        success: true,
        data: {
          cart,
          items,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit cart getItems API**

```bash
git add x-app/app/api/public/cart/getItems/route.ts
git commit -m "feat: add public cart getItems API endpoint"
```

---

## Task 9: Public Cart API - Update Item Quantity

**Files:**
- Create: `x-app/app/api/public/cart/updateItemQuantity/route.ts`

**Step 1: Create cart update item quantity endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { carts, cartItems, products } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/public/cart/updateItemQuantity:
 *   put:
 *     tags: [Public - Cart]
 *     summary: Update cart item quantity
 *     description: Update the quantity of an item in the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItemId
 *               - quantity
 *             properties:
 *               cartItemId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item quantity updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be non-negative' },
        { status: 400 }
      );
    }

    // If quantity is 0, delete the item
    if (quantity === 0) {
      const [deletedItem] = await db
        .delete(cartItems)
        .where(eq(cartItems.id, cartItemId))
        .returning();

      if (!deletedItem) {
        return NextResponse.json(
          { success: false, error: 'Cart item not found' },
          { status: 404 }
        );
      }

      // Update cart total
      const allCartItems = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, deletedItem.cartId));

      const totalAmount = allCartItems.reduce(
        (sum, item) => sum + parseFloat(item.totalPrice),
        0
      );

      await db
        .update(carts)
        .set({
          amount: totalAmount.toString(),
          updatedAt: new Date(),
        })
        .where(eq(carts.id, deletedItem.cartId));

      return NextResponse.json(
        { success: true, data: { deleted: true } },
        { status: 200 }
      );
    }

    // Get cart item
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, cartItemId));

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Update quantity and total price
    const newTotalPrice = (parseFloat(cartItem.price) * quantity).toString();

    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity,
        totalPrice: newTotalPrice,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId))
      .returning();

    // Update cart total
    const allCartItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartItem.cartId));

    const totalAmount = allCartItems.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice),
      0
    );

    await db
      .update(carts)
      .set({
        amount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartItem.cartId));

    return NextResponse.json(
      { success: true, data: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update cart item quantity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item quantity' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit cart updateItemQuantity API**

```bash
git add x-app/app/api/public/cart/updateItemQuantity/route.ts
git commit -m "feat: add public cart updateItemQuantity API endpoint"
```

---

## Task 10: Public Cart API - Remove Item

**Files:**
- Create: `x-app/app/api/public/cart/removeItem/route.ts`

**Step 1: Create cart remove item endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { carts, cartItems } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/public/cart/removeItem:
 *   delete:
 *     tags: [Public - Cart]
 *     summary: Remove item from cart
 *     description: Remove a specific item from the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItemId
 *             properties:
 *               cartItemId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemId } = body;

    if (!cartItemId) {
      return NextResponse.json(
        { success: false, error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    const [deletedItem] = await db
      .delete(cartItems)
      .where(eq(cartItems.id, cartItemId))
      .returning();

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Update cart total
    const allCartItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, deletedItem.cartId));

    const totalAmount = allCartItems.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice),
      0
    );

    await db
      .update(carts)
      .set({
        amount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(carts.id, deletedItem.cartId));

    return NextResponse.json(
      { success: true, data: { id: deletedItem.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit cart removeItem API**

```bash
git add x-app/app/api/public/cart/removeItem/route.ts
git commit -m "feat: add public cart removeItem API endpoint"
```

---

## Task 11: Public Order API - Create From Cart

**Files:**
- Create: `x-app/app/api/public/order/createFromCart/route.ts`

**Step 1: Create order from cart endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { orders, orderItems, carts, cartItems } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/public/order/createFromCart:
 *   post:
 *     tags: [Public - Orders]
 *     summary: Create order from cart
 *     description: Create a new order from cart items (status new, payment unpaid)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartId
 *             properties:
 *               cartId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request body or empty cart
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, userId } = body;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    // Get cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId));

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Get cart items
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: userId || null,
        status: 'new',
        paymentStatus: 'unpaid',
        amount: cart.amount,
      })
      .returning();

    // Create order items from cart items
    const orderItemsData = items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Clear cart items
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    // Reset cart amount
    await db
      .update(carts)
      .set({
        amount: '0',
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create order from cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order from cart' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit order createFromCart API**

```bash
git add x-app/app/api/public/order/createFromCart/route.ts
git commit -m "feat: add public order createFromCart API endpoint"
```

---

## Task 12: Public Order API - Update Payment Status

**Files:**
- Create: `x-app/app/api/public/order/updatePaymentStatus/route.ts`

**Step 1: Create order update payment status endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { orders } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/public/order/updatePaymentStatus:
 *   put:
 *     tags: [Public - Orders]
 *     summary: Update order payment status
 *     description: Update payment status after payment processing (paid/unpaid)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentStatus
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, unpaid]
 *                 example: "paid"
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       400:
 *         description: Invalid request body or payment status
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentStatus } = body;

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'Order ID and payment status are required' },
        { status: 400 }
      );
    }

    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment status. Must be "paid" or "unpaid"' },
        { status: 400 }
      );
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update payment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit order updatePaymentStatus API**

```bash
git add x-app/app/api/public/order/updatePaymentStatus/route.ts
git commit -m "feat: add public order updatePaymentStatus API endpoint"
```

---

## Task 13: Admin Order APIs - Get All Orders

**Files:**
- Create: `x-app/app/api/admin/order/getAll/route.ts`

**Step 1: Create admin order listing endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { orders } from '@/app/db/schema';

/**
 * @swagger
 * /api/admin/order/getAll:
 *   get:
 *     tags: [Admin - Orders]
 *     summary: Get all orders
 *     description: Admin endpoint to retrieve all orders in the system
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                         enum: [new, processing, cancelled, shipped]
 *                       paymentStatus:
 *                         type: string
 *                         enum: [unpaid, paid, refunded]
 *                       amount:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const allOrders = await db.select().from(orders);

    return NextResponse.json(
      { success: true, data: allOrders },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit admin order getAll API**

```bash
git add x-app/app/api/admin/order/getAll/route.ts
git commit -m "feat: add admin order getAll API endpoint"
```

---

## Task 14: Admin Order APIs - Update Status

**Files:**
- Create: `x-app/app/api/admin/order/updateStatus/route.ts`

**Step 1: Create admin order update status endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { orders } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/admin/order/updateStatus:
 *   put:
 *     tags: [Admin - Orders]
 *     summary: Update order status
 *     description: Admin endpoint to update order status (new -> processing -> shipped)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - status
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               status:
 *                 type: string
 *                 enum: [new, processing, shipped, cancelled]
 *                 example: "processing"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid request body or status
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['new', 'processing', 'shipped', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit admin order updateStatus API**

```bash
git add x-app/app/api/admin/order/updateStatus/route.ts
git commit -m "feat: add admin order updateStatus API endpoint"
```

---

## Task 15: Admin Order APIs - Cancel Order

**Files:**
- Create: `x-app/app/api/admin/order/cancel/route.ts`

**Step 1: Create admin order cancel endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { orders } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/admin/order/cancel:
 *   put:
 *     tags: [Admin - Orders]
 *     summary: Cancel order
 *     description: Admin endpoint to cancel an order (refund if paid)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status and payment status if paid
    const updateData: any = {
      status: 'cancelled',
      updatedAt: new Date(),
    };

    // If order was paid, mark as refunded
    if (order.paymentStatus === 'paid') {
      updateData.paymentStatus = 'refunded';
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
        message: order.paymentStatus === 'paid' ? 'Order cancelled and refunded' : 'Order cancelled',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to cancel order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit admin order cancel API**

```bash
git add x-app/app/api/admin/order/cancel/route.ts
git commit -m "feat: add admin order cancel API endpoint"
```

---

## Task 16: Admin User APIs - Create User

**Files:**
- Create: `x-app/app/api/admin/user/create/route.ts`

**Step 1: Create admin user creation endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users } from '@/app/db/schema';

/**
 * @swagger
 * /api/admin/user/create:
 *   post:
 *     tags: [Admin - Users]
 *     summary: Create a new user
 *     description: Admin endpoint to create a new user with role assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               role:
 *                 type: string
 *                 enum: [admin, user, customer]
 *                 example: "customer"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request body
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, role = 'customer' } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'user', 'customer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const [user] = await db
      .insert(users)
      .values({
        firstName: firstName || null,
        lastName: lastName || null,
        email,
        role,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create user:', error);

    // Check for unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit admin user create API**

```bash
git add x-app/app/api/admin/user/create/route.ts
git commit -m "feat: add admin user create API endpoint"
```

---

## Task 17: Admin User APIs - Get All Users

**Files:**
- Create: `x-app/app/api/admin/user/getAll/route.ts`

**Step 1: Create admin user listing endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users } from '@/app/db/schema';

/**
 * @swagger
 * /api/admin/user/getAll:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Get all users
 *     description: Admin endpoint to retrieve all users in the system
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       role:
 *                         type: string
 *                         enum: [admin, user, customer]
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const allUsers = await db.select().from(users);

    return NextResponse.json(
      { success: true, data: allUsers },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit admin user getAll API**

```bash
git add x-app/app/api/admin/user/getAll/route.ts
git commit -m "feat: add admin user getAll API endpoint"
```

---

## Task 18: Admin User APIs - Update User

**Files:**
- Create: `x-app/app/api/admin/user/update/route.ts`

**Step 1: Create admin user update endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/admin/user/update:
 *   put:
 *     tags: [Admin - Users]
 *     summary: Update a user
 *     description: Admin endpoint to update an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               firstName:
 *                 type: string
 *                 example: "Jane"
 *               lastName:
 *                 type: string
 *                 example: "Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.smith@example.com"
 *               role:
 *                 type: string
 *                 enum: [admin, user, customer]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, email, role } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      const validRoles = ['admin', 'user', 'customer'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to update user:', error);

    // Check for unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit admin user update API**

```bash
git add x-app/app/api/admin/user/update/route.ts
git commit -m "feat: add admin user update API endpoint"
```

---

## Task 19: Admin User APIs - Delete User

**Files:**
- Create: `x-app/app/api/admin/user/delete/route.ts`

**Step 1: Create admin user delete endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/admin/user/delete:
 *   delete:
 *     tags: [Admin - Users]
 *     summary: Delete a user
 *     description: Admin endpoint to delete a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { id: deletedUser.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit admin user delete API**

```bash
git add x-app/app/api/admin/user/delete/route.ts
git commit -m "feat: add admin user delete API endpoint"
```

---

## Task 20: Setup OpenAPI/Swagger Documentation

**Files:**
- Create: `x-app/app/api/swagger/route.ts`
- Create: `x-app/public/swagger.html`

**Step 1: Install swagger-jsdoc and swagger-ui dependencies**

Run: `cd x-app && npm install swagger-jsdoc swagger-ui-react`
Expected: Dependencies installed successfully

**Step 2: Create Swagger configuration endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Get OpenAPI specification
 *     description: Returns the OpenAPI specification for all API endpoints
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest) {
  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'Complete REST API for e-commerce system with product management, cart operations, order processing, and user management',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    tags: [
      { name: 'Admin - Products', description: 'Admin product management endpoints' },
      { name: 'Admin - Orders', description: 'Admin order management endpoints' },
      { name: 'Admin - Users', description: 'Admin user management endpoints' },
      { name: 'Public - Products', description: 'Public product browsing endpoints' },
      { name: 'Public - Cart', description: 'Public cart management endpoints' },
      { name: 'Public - Orders', description: 'Public order creation and payment endpoints' },
    ],
    paths: {
      '/api/admin/product/create': {
        post: {
          tags: ['Admin - Products'],
          summary: 'Create a new product',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'price'],
                  properties: {
                    name: { type: 'string', example: 'Wireless Mouse' },
                    description: { type: 'string', example: 'Ergonomic wireless mouse' },
                    price: { type: 'number', example: 29.99 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Product created successfully' },
            400: { description: 'Invalid request body' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/product/getAll': {
        get: {
          tags: ['Admin - Products'],
          summary: 'Get all products',
          responses: {
            200: { description: 'Products retrieved successfully' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/product/update': {
        put: {
          tags: ['Admin - Products'],
          summary: 'Update a product',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Product updated successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Product not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/product/delete': {
        delete: {
          tags: ['Admin - Products'],
          summary: 'Delete a product',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Product deleted successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Product not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/public/product/getAll': {
        get: {
          tags: ['Public - Products'],
          summary: 'Get all products (public)',
          responses: {
            200: { description: 'Products retrieved successfully' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/public/cart/addItem': {
        post: {
          tags: ['Public - Cart'],
          summary: 'Add item to cart',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId'],
                  properties: {
                    cartId: { type: 'string', format: 'uuid' },
                    productId: { type: 'string', format: 'uuid' },
                    quantity: { type: 'integer', example: 1 },
                    userId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Item added to cart successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Product not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/public/cart/getItems': {
        get: {
          tags: ['Public - Cart'],
          summary: 'Get cart items',
          parameters: [
            {
              in: 'query',
              name: 'cartId',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: { description: 'Cart items retrieved successfully' },
            400: { description: 'Cart ID is required' },
            404: { description: 'Cart not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/public/cart/updateItemQuantity': {
        put: {
          tags: ['Public - Cart'],
          summary: 'Update cart item quantity',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['cartItemId', 'quantity'],
                  properties: {
                    cartItemId: { type: 'string', format: 'uuid' },
                    quantity: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Cart item quantity updated successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Cart item not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/public/cart/removeItem': {
        delete: {
          tags: ['Public - Cart'],
          summary: 'Remove item from cart',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['cartItemId'],
                  properties: {
                    cartItemId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Cart item removed successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Cart item not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/public/order/createFromCart': {
        post: {
          tags: ['Public - Orders'],
          summary: 'Create order from cart',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['cartId'],
                  properties: {
                    cartId: { type: 'string', format: 'uuid' },
                    userId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Order created successfully' },
            400: { description: 'Invalid request body or empty cart' },
            404: { description: 'Cart not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/public/order/updatePaymentStatus': {
        put: {
          tags: ['Public - Orders'],
          summary: 'Update order payment status',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['orderId', 'paymentStatus'],
                  properties: {
                    orderId: { type: 'string', format: 'uuid' },
                    paymentStatus: { type: 'string', enum: ['paid', 'unpaid'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Payment status updated successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Order not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/order/getAll': {
        get: {
          tags: ['Admin - Orders'],
          summary: 'Get all orders',
          responses: {
            200: { description: 'Orders retrieved successfully' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/order/updateStatus': {
        put: {
          tags: ['Admin - Orders'],
          summary: 'Update order status',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['orderId', 'status'],
                  properties: {
                    orderId: { type: 'string', format: 'uuid' },
                    status: { type: 'string', enum: ['new', 'processing', 'shipped', 'cancelled'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Order status updated successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Order not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/order/cancel': {
        put: {
          tags: ['Admin - Orders'],
          summary: 'Cancel order',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['orderId'],
                  properties: {
                    orderId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Order cancelled successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'Order not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/user/create': {
        post: {
          tags: ['Admin - Users'],
          summary: 'Create a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    role: { type: 'string', enum: ['admin', 'user', 'customer'], example: 'customer' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User created successfully' },
            400: { description: 'Invalid request body' },
            409: { description: 'Email already exists' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/user/getAll': {
        get: {
          tags: ['Admin - Users'],
          summary: 'Get all users',
          responses: {
            200: { description: 'Users retrieved successfully' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/user/update': {
        put: {
          tags: ['Admin - Users'],
          summary: 'Update a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['admin', 'user', 'customer'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'User updated successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'User not found' },
            409: { description: 'Email already exists' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/api/admin/user/delete': {
        delete: {
          tags: ['Admin - Users'],
          summary: 'Delete a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'User deleted successfully' },
            400: { description: 'Invalid request body' },
            404: { description: 'User not found' },
            500: { description: 'Internal server error' },
          },
        },
      },
    },
  };

  return NextResponse.json(swaggerSpec, { status: 200 });
}
```

**Step 3: Create Swagger UI page**

Create file: `x-app/app/api-docs/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState(null);

  useEffect(() => {
    fetch('/api/swagger')
      .then((res) => res.json())
      .then((data) => setSwaggerSpec(data));
  }, []);

  if (!swaggerSpec) {
    return <div style={{ padding: '20px' }}>Loading API documentation...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>E-commerce API Documentation</h1>
      <div style={{ marginTop: '20px' }}>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
          {JSON.stringify(swaggerSpec, null, 2)}
        </pre>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>
          To view this in Swagger UI, copy the JSON above and paste it into{' '}
          <a href="https://editor.swagger.io/" target="_blank" rel="noopener noreferrer">
            Swagger Editor
          </a>
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Commit Swagger documentation setup**

```bash
git add x-app/app/api/swagger/route.ts x-app/app/api-docs/page.tsx
git commit -m "feat: add OpenAPI/Swagger documentation endpoint and UI"
```

---

## Summary

This plan creates a complete REST API backend for the e-commerce system with:

**Admin APIs:**
- Product Management: create, getAll, update, delete
- Order Management: getAll, updateStatus, cancel
- User Management: create, getAll, update, delete

**Public APIs:**
- Product Browsing: getAll
- Cart Operations: addItem, getItems, updateItemQuantity, removeItem
- Order Processing: createFromCart, updatePaymentStatus

**Technical Implementation:**
- Each API endpoint is a single route.ts file
- PostgreSQL database with Drizzle ORM
- TypeScript for type safety
- OpenAPI/Swagger documentation
- No tests in this version (as requested)

**Database Schema includes:**
- Users (with role-based access)
- Products (with file attachments)
- Carts and Cart Items
- Orders and Order Items
- File storage for product images

**Next Steps:**
After completing all tasks, the backend will be ready for:
- Frontend integration
- Authentication/authorization implementation
- Payment gateway integration
- Testing implementation (future version)
