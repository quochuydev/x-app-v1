# Admin Order Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete order management system for admins - view orders, update status (new → processing → shipped), handle cancellations and refunds.

**Architecture:** Server Actions for order status updates and cancellations, server components for data fetching, real-time status workflow visualization. Follows event-driven pattern from ecommerce-overview.md.

**Tech Stack:** Next.js 15 App Router, Server Actions, Drizzle ORM, shadcn/ui Badge component for status

---

## Task 1: Create Order Actions (Server Actions)

**Files:**
- Create: `x-app/app/admin/order/actions.ts`

**Step 1: Create actions file with status update**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/app/db/drizzle';
import { order, transaction } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const statusSchema = z.enum(['new', 'processing', 'cancelled', 'shipped']);
const paymentStatusSchema = z.enum(['unpaid', 'paid', 'refunded']);

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: z.infer<typeof statusSchema>
) {
  statusSchema.parse(newStatus);

  await db.update(order)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(order.id, orderId));

  revalidatePath('/admin/order');
  revalidatePath(`/admin/order/${orderId}`);
  return { success: true };
}
```

**Step 2: Add cancel order action with refund logic**

```typescript
export async function cancelOrderAction(orderId: string) {
  // Get current order
  const [currentOrder] = await db
    .select()
    .from(order)
    .where(eq(order.id, orderId));

  if (!currentOrder) {
    throw new Error('Order not found');
  }

  // If paid, process refund
  if (currentOrder.paymentStatus === 'paid') {
    // Update payment status to refunded
    await db.update(order)
      .set({
        status: 'cancelled',
        paymentStatus: 'refunded',
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderId));

    // Create refund transaction record
    await db.insert(transaction).values({
      orderId,
      amount: currentOrder.amount,
      status: 'success',
    });
  } else {
    // Just cancel if not paid
    await db.update(order)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderId));
  }

  revalidatePath('/admin/order');
  return { success: true, refunded: currentOrder.paymentStatus === 'paid' };
}
```

**Step 3: Commit**

```bash
git add x-app/app/admin/order/actions.ts
git commit -m "feat(admin): add order status update and cancel actions"
```

---

## Task 2: Create Order List Page

**Files:**
- Create: `x-app/app/admin/order/page.tsx`

**Step 1: Create order list with filters**

```typescript
import { db } from '@/app/db/drizzle';
import { order, user, orderItem, product } from '@/app/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { OrderStatusBadge } from './order-status-badge';

export default async function OrderManagementPage() {
  // Fetch all orders with user info
  const orders = await db
    .select({
      id: order.id,
      amount: order.amount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customerName: user.firstName,
      customerEmail: user.email,
    })
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .orderBy(desc(order.createdAt));

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">
                    {o.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {o.customerName || 'Guest'}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {o.customerEmail}
                    </span>
                  </TableCell>
                  <TableCell>${o.amount}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        o.paymentStatus === 'paid'
                          ? 'default'
                          : o.paymentStatus === 'refunded'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {o.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{o.createdAt?.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/admin/order/${o.id}`}>
                      <span className="text-sm text-blue-600 hover:underline">
                        View Details
                      </span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Install badge component**

Run: `cd x-app && npx shadcn@latest add badge`
Expected: Badge component created

**Step 3: Commit**

```bash
git add x-app/app/admin/order/page.tsx
git commit -m "feat(admin): add order list page with status badges"
```

---

## Task 3: Create Order Status Badge Component

**Files:**
- Create: `x-app/app/admin/order/order-status-badge.tsx`

**Step 1: Create status badge component**

```typescript
import { Badge } from '@/components/ui/badge';

type OrderStatus = 'new' | 'processing' | 'cancelled' | 'shipped';

const statusConfig: Record<OrderStatus, { label: string; variant: any }> = {
  new: { label: 'New', variant: 'outline' },
  processing: { label: 'Processing', variant: 'default' },
  shipped: { label: 'Shipped', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as OrderStatus] || {
    label: status,
    variant: 'outline',
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

**Step 2: Commit**

```bash
git add x-app/app/admin/order/order-status-badge.tsx
git commit -m "feat(admin): add order status badge component"
```

---

## Task 4: Create Order Detail Page with Status Workflow

**Files:**
- Create: `x-app/app/admin/order/[id]/page.tsx`

**Step 1: Create order detail page**

```typescript
import { db } from '@/app/db/drizzle';
import { order, orderItem, product, user } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderStatusBadge } from '../order-status-badge';
import { OrderWorkflow } from './order-workflow';

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch order with user
  const [orderData] = await db
    .select({
      id: order.id,
      amount: order.amount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customerName: user.firstName,
      customerLastName: user.lastName,
      customerEmail: user.email,
    })
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .where(eq(order.id, params.id));

  if (!orderData) {
    notFound();
  }

  // Fetch order items
  const items = await db
    .select({
      id: orderItem.id,
      quantity: orderItem.quantity,
      price: orderItem.price,
      productName: product.name,
    })
    .from(orderItem)
    .leftJoin(product, eq(orderItem.productId, product.id))
    .where(eq(orderItem.orderId, params.id));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono">{orderData.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p>
                {orderData.customerName} {orderData.customerLastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {orderData.customerEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <OrderStatusBadge status={orderData.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p className="font-semibold">{orderData.paymentStatus}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="font-bold">
                  ${orderData.amount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OrderWorkflow
        orderId={orderData.id}
        currentStatus={orderData.status}
        paymentStatus={orderData.paymentStatus}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/admin/order/[id]/page.tsx
git commit -m "feat(admin): add order detail page"
```

---

## Task 5: Create Order Workflow Component

**Files:**
- Create: `x-app/app/admin/order/[id]/order-workflow.tsx`

**Step 1: Create workflow component with status actions**

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateOrderStatusAction, cancelOrderAction } from '../actions';
import { useRouter } from 'next/navigation';

interface OrderWorkflowProps {
  orderId: string;
  currentStatus: string;
  paymentStatus: string;
}

export function OrderWorkflow({
  orderId,
  currentStatus,
  paymentStatus,
}: OrderWorkflowProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusUpdate(newStatus: string) {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(orderId, newStatus as any);
      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setIsUpdating(true);
    try {
      const result = await cancelOrderAction(orderId);
      if (result.refunded) {
        alert('Order cancelled and refund processed');
      } else {
        alert('Order cancelled');
      }
      router.refresh();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  const canProcessOrder = currentStatus === 'new' && paymentStatus === 'paid';
  const canShip = currentStatus === 'processing';
  const canCancel = ['new', 'processing'].includes(currentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {canProcessOrder && (
            <Button
              onClick={() => handleStatusUpdate('processing')}
              disabled={isUpdating}
            >
              Start Processing
            </Button>
          )}

          {canShip && (
            <Button
              onClick={() => handleStatusUpdate('shipped')}
              disabled={isUpdating}
            >
              Mark as Shipped
            </Button>
          )}

          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel Order
            </Button>
          )}

          {!canProcessOrder && !canShip && !canCancel && (
            <p className="text-sm text-muted-foreground">
              No actions available for current status
            </p>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Current workflow: {currentStatus}</p>
          {currentStatus === 'new' && paymentStatus === 'unpaid' && (
            <p className="text-yellow-600">
              Waiting for payment before processing
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/admin/order/[id]/order-workflow.tsx
git commit -m "feat(admin): add order workflow component with status actions"
```

---

## Verification Checklist

- [ ] Order list displays all orders with correct status
- [ ] Order detail page shows customer and items
- [ ] Status updates (new → processing → shipped) work
- [ ] Cancel order works and processes refund if paid
- [ ] Payment status badges display correctly
- [ ] Workflow buttons appear based on current status

---

## Next Steps

1. Add order filtering and search
2. Implement user management
3. Build storefront checkout flow
4. Add email notifications for order status changes
