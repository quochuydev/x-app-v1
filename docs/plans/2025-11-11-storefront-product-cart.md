# Storefront Product Discovery & Cart Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build customer-facing product browsing with masonry grid, product details, and shopping cart with slide-out drawer.

**Architecture:** Server components for product listing, client components for cart interactions, Server Actions for cart mutations. Cart uses session-based approach for anonymous users. Follows Shopify storefront patterns from intent-layout-storefront.yaml.

**Tech Stack:** Next.js 15 App Router, Server Actions, Drizzle ORM, shadcn Sheet for cart drawer, Embla Carousel

---

## Task 1: Create Product Listing Page (Storefront)

**Files:**
- Create: `x-app/app/(storefront)/products/page.tsx`
- Create: `x-app/app/(storefront)/layout.tsx`

**Step 1: Create storefront layout with header**

```typescript
import Link from 'next/link';
import { CartIcon } from './cart-icon';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/products" className="text-xl font-bold">
              Store
            </Link>
            <nav className="flex gap-6">
              <Link href="/products" className="text-sm hover:underline">
                Shop All
              </Link>
              <Link href="/cart" className="text-sm hover:underline">
                Cart
              </Link>
            </nav>
            <CartIcon />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

**Step 2: Create product listing with grid**

Create `x-app/app/(storefront)/products/page.tsx`:

```typescript
import { db } from '@/app/db/drizzle';
import { product, file, category } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { ProductCard } from './product-card';

export default async function ProductsPage() {
  // Fetch all products with first image
  const products = await db
    .select({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      categoryName: category.name,
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No products available yet.</p>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add x-app/app/\(storefront\)/
git commit -m "feat(storefront): add product listing page with layout"
```

---

## Task 2: Create Product Card Component

**Files:**
- Create: `x-app/app/(storefront)/products/product-card.tsx`

**Step 1: Create product card with image placeholder**

```typescript
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '../add-to-cart-button';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  categoryName: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-slate-100 flex items-center justify-center">
          <span className="text-slate-400 text-sm">No Image</span>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold hover:underline line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.categoryName && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.categoryName}
          </p>
        )}
        <p className="text-lg font-bold mt-2">${product.price}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <AddToCartButton
          productId={product.id}
          productName={product.name}
          price={product.price}
        />
      </CardFooter>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/products/product-card.tsx
git commit -m "feat(storefront): add product card component"
```

---

## Task 3: Create Cart Server Actions

**Files:**
- Create: `x-app/app/(storefront)/cart-actions.ts`

**Step 1: Create cart actions with session handling**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/app/db/drizzle';
import { cart, cartItem, product } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Get or create session cart ID
async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    // Check if cart exists, otherwise create new
    const sessionId = randomUUID();
    const [newCart] = await db.insert(cart).values({
      sessionId,
      amount: '0',
    }).returning();

    cartId = newCart.id;
    cookieStore.set('cartId', cartId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return cartId;
}

export async function addToCartAction(
  productId: string,
  quantity: number = 1
) {
  const cartId = await getOrCreateCartId();

  // Get product details
  const [productData] = await db
    .select()
    .from(product)
    .where(eq(product.id, productId));

  if (!productData) {
    throw new Error('Product not found');
  }

  // Check if item already in cart
  const existingItems = await db
    .select()
    .from(cartItem)
    .where(
      and(
        eq(cartItem.cartId, cartId),
        eq(cartItem.productId, productId)
      )
    );

  if (existingItems.length > 0) {
    // Update quantity
    const newQuantity = existingItems[0].quantity + quantity;
    const newTotal = (Number(productData.price) * newQuantity).toFixed(2);

    await db.update(cartItem)
      .set({
        quantity: newQuantity,
        totalPrice: newTotal,
      })
      .where(eq(cartItem.id, existingItems[0].id));
  } else {
    // Add new item
    await db.insert(cartItem).values({
      cartId,
      productId,
      price: productData.price,
      quantity,
      totalPrice: (Number(productData.price) * quantity).toFixed(2),
    });
  }

  // Update cart total
  await updateCartTotal(cartId);

  revalidatePath('/products');
  revalidatePath('/cart');
  return { success: true };
}
```

**Step 2: Add update quantity and remove item actions**

```typescript
export async function updateCartItemQuantityAction(
  itemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    await db.delete(cartItem).where(eq(cartItem.id, itemId));
  } else {
    const [item] = await db
      .select()
      .from(cartItem)
      .where(eq(cartItem.id, itemId));

    const newTotal = (Number(item.price) * quantity).toFixed(2);

    await db.update(cartItem)
      .set({
        quantity,
        totalPrice: newTotal,
      })
      .where(eq(cartItem.id, itemId));

    await updateCartTotal(item.cartId);
  }

  revalidatePath('/cart');
  return { success: true };
}

export async function removeCartItemAction(itemId: string) {
  const [item] = await db
    .select()
    .from(cartItem)
    .where(eq(cartItem.id, itemId));

  await db.delete(cartItem).where(eq(cartItem.id, itemId));
  await updateCartTotal(item.cartId);

  revalidatePath('/cart');
  return { success: true };
}

async function updateCartTotal(cartId: string) {
  const items = await db
    .select()
    .from(cartItem)
    .where(eq(cartItem.cartId, cartId));

  const total = items.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  ).toFixed(2);

  await db.update(cart)
    .set({ amount: total })
    .where(eq(cart.id, cartId));
}
```

**Step 3: Add get cart items action**

```typescript
export async function getCartItemsAction() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return [];
  }

  const items = await db
    .select({
      id: cartItem.id,
      quantity: cartItem.quantity,
      price: cartItem.price,
      totalPrice: cartItem.totalPrice,
      productId: product.id,
      productName: product.name,
    })
    .from(cartItem)
    .leftJoin(product, eq(cartItem.productId, product.id))
    .where(eq(cartItem.cartId, cartId));

  return items;
}

export async function getCartTotalAction() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return { total: '0.00', itemCount: 0 };
  }

  const [cartData] = await db
    .select()
    .from(cart)
    .where(eq(cart.id, cartId));

  const items = await db
    .select()
    .from(cartItem)
    .where(eq(cartItem.cartId, cartId));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    total: cartData?.amount || '0.00',
    itemCount,
  };
}
```

**Step 4: Commit**

```bash
git add x-app/app/\(storefront\)/cart-actions.ts
git commit -m "feat(storefront): add cart server actions"
```

---

## Task 4: Create Add to Cart Button

**Files:**
- Create: `x-app/app/(storefront)/add-to-cart-button.tsx`

**Step 1: Create add to cart button component**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addToCartAction } from './cart-actions';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: string;
}

export function AddToCartButton({
  productId,
  productName,
  price,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddToCart() {
    setIsAdding(true);
    try {
      await addToCartAction(productId, 1);
      router.refresh();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="w-full"
    >
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/add-to-cart-button.tsx
git commit -m "feat(storefront): add cart button component"
```

---

## Task 5: Create Cart Icon with Item Count

**Files:**
- Create: `x-app/app/(storefront)/cart-icon.tsx`

**Step 1: Create cart icon component**

```typescript
import Link from 'next/link';
import { getCartTotalAction } from './cart-actions';
import { Badge } from '@/components/ui/badge';

export async function CartIcon() {
  const { itemCount } = await getCartTotalAction();

  return (
    <Link href="/cart" className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {itemCount}
        </Badge>
      )}
    </Link>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/cart-icon.tsx
git commit -m "feat(storefront): add cart icon with item count"
```

---

## Task 6: Create Cart Page

**Files:**
- Create: `x-app/app/(storefront)/cart/page.tsx`

**Step 1: Create cart page with items list**

```typescript
import { getCartItemsAction, getCartTotalAction } from '../cart-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CartItemRow } from './cart-item-row';

export default async function CartPage() {
  const items = await getCartItemsAction();
  const { total } = await getCartTotalAction();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-between items-center border-t pt-6">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold">${total}</span>
          </div>

          <div className="mt-6 flex gap-4">
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/checkout" className="flex-1">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/cart/page.tsx
git commit -m "feat(storefront): add cart page"
```

---

## Task 7: Create Cart Item Row Component

**Files:**
- Create: `x-app/app/(storefront)/cart/cart-item-row.tsx`

**Step 1: Create cart item with quantity controls**

```typescript
'use client';

import { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  updateCartItemQuantityAction,
  removeCartItemAction,
} from '../cart-actions';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  productName: string | null;
  price: string;
  quantity: number;
  totalPrice: string;
}

export function CartItemRow({ item }: { item: CartItem }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleQuantityChange(newQty: number) {
    if (newQty < 1) return;
    setQuantity(newQty);
    setIsUpdating(true);

    try {
      await updateCartItemQuantityAction(item.id, newQty);
      router.refresh();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove() {
    setIsUpdating(true);
    try {
      await removeCartItemAction(item.id);
      router.refresh();
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsUpdating(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{item.productName}</TableCell>
      <TableCell>${item.price}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 w-32">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isUpdating || quantity <= 1}
          >
            -
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            disabled={isUpdating}
            className="text-center"
            min="1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isUpdating}
          >
            +
          </Button>
        </div>
      </TableCell>
      <TableCell className="font-semibold">${item.totalPrice}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isUpdating}
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/\(storefront\)/cart/cart-item-row.tsx
git commit -m "feat(storefront): add cart item row with quantity controls"
```

---

## Verification Checklist

- [ ] Product grid displays all products
- [ ] Add to cart button works
- [ ] Cart icon shows item count
- [ ] Cart page displays all items
- [ ] Quantity increment/decrement works
- [ ] Remove item from cart works
- [ ] Cart total calculates correctly
- [ ] Session persists across page refreshes

---

## Next Steps

1. Implement product detail page
2. Build checkout flow
3. Add product images display
4. Implement product filtering and search
