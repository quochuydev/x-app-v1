# Storefront Checkout & Payment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete checkout flow - customer information, order creation, payment processing, and order confirmation.

**Architecture:** Multi-step checkout process with Server Actions for order creation and payment. Follows the flow: cart → checkout form → payment → confirmation. Payment status tracking (unpaid/paid/refunded) as per ecommerce-overview.md.

**Tech Stack:** Next.js 15 App Router, Server Actions, react-hook-form + zod, Stripe (mock for demo)

---

## Task 1: Create Checkout Actions

**Files:**
- Create: `x-app/app/(storefront)/checkout/actions.ts`

**Step 1: Create order creation action**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/app/db/drizzle';
import {
  order,
  orderItem,
  cart,
  cartItem,
  product,
} from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createOrderFromCartAction(data: CheckoutInput) {
  // Validate input
  const validated = checkoutSchema.parse(data);

  // Get cart ID from cookie
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    throw new Error('No cart found');
  }

  // Get cart and items
  const [cartData] = await db.select().from(cart).where(eq(cart.id, cartId));

  if (!cartData) {
    throw new Error('Cart not found');
  }

  const items = await db
    .select({
      id: cartItem.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: cartItem.price,
    })
    .from(cartItem)
    .where(eq(cartItem.cartId, cartId));

  if (items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Create order with status "new" and payment status "unpaid"
  const [newOrder] = await db.insert(order).values({
    userId: null, // Anonymous checkout
    status: 'new',
    paymentStatus: 'unpaid',
    amount: cartData.amount,
  }).returning();

  // Create order items from cart items
  await db.insert(orderItem).values(
    items.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }))
  );

  // Clear cart
  await db.delete(cartItem).where(eq(cartItem.cartId, cartId));
  await db.update(cart)
    .set({ amount: '0' })
    .where(eq(cart.id, cartId));

  revalidatePath('/cart');
  revalidatePath('/checkout');

  return {
    success: true,
    orderId: newOrder.id,
    amount: newOrder.amount,
  };
}
```

**Step 2: Create payment processing action**

```typescript
export async function processPaymentAction(
  orderId: string,
  paymentMethod: 'card' | 'paypal'
) {
  // Get order
  const [orderData] = await db
    .select()
    .from(order)
    .where(eq(order.id, orderId));

  if (!orderData) {
    throw new Error('Order not found');
  }

  // Mock payment processing
  // In production, integrate with Stripe, PayPal, etc.
  const paymentSuccessful = Math.random() > 0.1; // 90% success rate for demo

  if (paymentSuccessful) {
    // Update order payment status to "paid"
    await db.update(order)
      .set({
        paymentStatus: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(order.id, orderId));

    return {
      success: true,
      orderId,
      paymentStatus: 'paid',
    };
  } else {
    // Keep payment status as "unpaid"
    return {
      success: false,
      orderId,
      paymentStatus: 'unpaid',
      error: 'Payment failed. Please try again.',
    };
  }
}
```

**Step 3: Commit**

```bash
git add x-app/app/\(storefront\)/checkout/actions.ts
git commit -m "feat(checkout): add order creation and payment actions"
```

---

## Task 2: Create Checkout Form Page

**Files:**
- Create: `x-app/app/(storefront)/checkout/page.tsx`

**Step 1: Create checkout page with form**

```typescript
import { getCartItemsAction, getCartTotalAction } from '../cart-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { CheckoutForm } from './checkout-form';

export default async function CheckoutPage() {
  const items = await getCartItemsAction();
  const { total, itemCount } = await getCartTotalAction();

  // Redirect if cart is empty
  if (items.length === 0) {
    redirect('/cart');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckoutForm totalAmount={total} />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">${item.totalPrice}</p>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/checkout/page.tsx
git commit -m "feat(checkout): add checkout page with order summary"
```

---

## Task 3: Create Checkout Form Component

**Files:**
- Create: `x-app/app/(storefront)/checkout/checkout-form.tsx`

**Step 1: Create form component**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createOrderFromCartAction } from './actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const checkoutFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm({ totalAmount }: { totalAmount: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
  });

  async function onSubmit(data: CheckoutFormValues) {
    setError(null);
    try {
      const result = await createOrderFromCartAction(data);

      if (result.success) {
        // Redirect to payment page
        router.push(`/checkout/payment?orderId=${result.orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="10001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="USA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? 'Processing...'
            : `Continue to Payment ($${totalAmount})`
          }
        </Button>
      </form>
    </Form>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/checkout/checkout-form.tsx
git commit -m "feat(checkout): add checkout form with validation"
```

---

## Task 4: Create Payment Page

**Files:**
- Create: `x-app/app/(storefront)/checkout/payment/page.tsx`

**Step 1: Create payment page**

```typescript
import { db } from '@/app/db/drizzle';
import { order } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentForm } from './payment-form';

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  if (!searchParams.orderId) {
    redirect('/checkout');
  }

  // Get order
  const [orderData] = await db
    .select()
    .from(order)
    .where(eq(order.id, searchParams.orderId));

  if (!orderData) {
    redirect('/checkout');
  }

  // If already paid, redirect to confirmation
  if (orderData.paymentStatus === 'paid') {
    redirect(`/checkout/confirmation?orderId=${orderData.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Payment</h1>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Order Total</span>
              <span className="text-2xl font-bold">${orderData.amount}</span>
            </div>
          </div>

          <PaymentForm
            orderId={orderData.id}
            amount={orderData.amount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/checkout/payment/page.tsx
git commit -m "feat(checkout): add payment page"
```

---

## Task 5: Create Payment Form Component

**Files:**
- Create: `x-app/app/(storefront)/checkout/payment/payment-form.tsx`

**Step 1: Create payment form**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { processPaymentAction } from '../actions';
import { useRouter } from 'next/navigation';

export function PaymentForm({
  orderId,
  amount,
}: {
  orderId: string;
  amount: string;
}) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment() {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await processPaymentAction(orderId, paymentMethod);

      if (result.success) {
        // Redirect to confirmation page
        router.push(`/checkout/confirmation?orderId=${orderId}`);
      } else {
        setError(result.error || 'Payment failed');
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card">Credit/Debit Card</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal">PayPal</Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="123" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          {error}
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${amount}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        This is a demo payment. No actual charges will be made.
      </p>
    </div>
  );
}
```

**Step 2: Install radio-group component**

Run: `cd x-app && npx shadcn@latest add radio-group`
Expected: RadioGroup component created

**Step 3: Commit**

```bash
git add x-app/app/\(storefront\)/checkout/payment/payment-form.tsx
git commit -m "feat(checkout): add payment form with method selection"
```

---

## Task 6: Create Order Confirmation Page

**Files:**
- Create: `x-app/app/(storefront)/checkout/confirmation/page.tsx`

**Step 1: Create confirmation page**

```typescript
import { db } from '@/app/db/drizzle';
import { order, orderItem, product } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  if (!searchParams.orderId) {
    redirect('/');
  }

  // Get order
  const [orderData] = await db
    .select()
    .from(order)
    .where(eq(order.id, searchParams.orderId));

  if (!orderData) {
    redirect('/');
  }

  // Get order items
  const items = await db
    .select({
      id: orderItem.id,
      quantity: orderItem.quantity,
      price: orderItem.price,
      productName: product.name,
    })
    .from(orderItem)
    .leftJoin(product, eq(orderItem.productId, product.id))
    .where(eq(orderItem.orderId, searchParams.orderId));

  const isPaymentSuccessful = orderData.paymentStatus === 'paid';

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          {isPaymentSuccessful ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
              <p className="text-muted-foreground mt-2">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">Payment Failed</CardTitle>
              <p className="text-muted-foreground mt-2">
                Your order was created but payment failed. Please try again.
              </p>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm">{orderData.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge
                variant={isPaymentSuccessful ? 'default' : 'destructive'}
              >
                {orderData.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${orderData.amount}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            {!isPaymentSuccessful && (
              <Link
                href={`/checkout/payment?orderId=${orderData.id}`}
                className="flex-1"
              >
                <Button className="w-full">
                  Retry Payment
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/checkout/confirmation/page.tsx
git commit -m "feat(checkout): add order confirmation page"
```

---

## Verification Checklist

- [ ] Checkout form validates all required fields
- [ ] Order creates with status "new" and payment "unpaid"
- [ ] Payment page displays order total
- [ ] Payment success updates order to "paid"
- [ ] Payment failure keeps order as "unpaid"
- [ ] Confirmation page shows success/failure state
- [ ] Retry payment link appears on failed payment
- [ ] Cart clears after order creation

---

## Next Steps

1. Integrate real payment gateway (Stripe/PayPal)
2. Add email notifications for order confirmation
3. Implement coupon/promo code application
4. Add order tracking for customers
5. Build customer account order history
