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
