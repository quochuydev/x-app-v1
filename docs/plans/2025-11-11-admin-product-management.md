# Admin Product Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete product management system for admin users - create, read, update, delete products with image upload, category assignment, and inventory tracking.

**Architecture:** Server Actions for mutations (create, update, delete), server components for data fetching, Shopify Polaris-inspired UI with shadcn components. File uploads handled via API routes with local storage. Following Next.js App Router patterns from existing `/app/db/` implementation.

**Tech Stack:** Next.js 15 App Router, Server Actions, Drizzle ORM, shadcn/ui components, react-hook-form + zod

---

## Task 1: Install shadcn/ui and Required Dependencies

**Files:**
- Modify: `x-app/package.json`
- Create: `x-app/components.json`

**Step 1: Initialize shadcn/ui**

Run: `cd x-app && npx shadcn@latest init`
Choose:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Expected: Creates `components.json`, `lib/utils.ts`, `tailwind.config.ts`

**Step 2: Install form dependencies**

Run: `cd x-app && bun add react-hook-form zod @hookform/resolvers`
Expected: Dependencies added to package.json

**Step 3: Install required shadcn components**

Run: `cd x-app && npx shadcn@latest add button card input label textarea select table badge dialog form`
Expected: Components created in `x-app/components/ui/`

**Step 4: Commit**

```bash
git add .
git commit -m "feat(ui): initialize shadcn/ui with core components"
```

---

## Task 2: Create Product Actions (Server Actions)

**Files:**
- Create: `x-app/app/admin/product/actions.ts`

**Step 1: Create actions file with imports**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/app/db/drizzle';
import { product, file } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  categoryId: z.string().uuid().optional(),
});

type ProductInput = z.infer<typeof productSchema>;
```

**Step 2: Implement createProduct action**

```typescript
export async function createProductAction(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    categoryId: formData.get('categoryId') as string | undefined,
  };

  // Validate input
  const validated = productSchema.parse(data);

  // Insert product
  const [newProduct] = await db.insert(product).values({
    name: validated.name,
    description: validated.description || null,
    price: validated.price,
    categoryId: validated.categoryId || null,
  }).returning();

  revalidatePath('/admin/product');
  return { success: true, productId: newProduct.id };
}
```

**Step 3: Implement updateProduct action**

```typescript
export async function updateProductAction(productId: string, formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    categoryId: formData.get('categoryId') as string | undefined,
  };

  const validated = productSchema.parse(data);

  await db.update(product)
    .set({
      name: validated.name,
      description: validated.description || null,
      price: validated.price,
      categoryId: validated.categoryId || null,
      updatedAt: new Date(),
    })
    .where(eq(product.id, productId));

  revalidatePath('/admin/product');
  revalidatePath(`/admin/product/${productId}`);
  return { success: true };
}
```

**Step 4: Implement deleteProduct action**

```typescript
export async function deleteProductAction(formData: FormData) {
  const productId = formData.get('productId') as string;

  if (!productId) {
    throw new Error('Product ID is required');
  }

  // Delete product (cascade will handle files)
  await db.delete(product).where(eq(product.id, productId));

  revalidatePath('/admin/product');
  return { success: true };
}
```

**Step 5: Commit**

```bash
git add x-app/app/admin/product/actions.ts
git commit -m "feat(admin): add product CRUD server actions"
```

---

## Task 3: Create Product List Page (Read)

**Files:**
- Create: `x-app/app/admin/product/page.tsx`

**Step 1: Create directory and page file**

Run: `mkdir -p x-app/app/admin/product`

**Step 2: Create product list page**

```typescript
import { db } from '@/app/db/drizzle';
import { product, category } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteProductButton } from './delete-product-button';

export default async function ProductManagementPage() {
  // Fetch all products with category
  const products = await db
    .select({
      id: product.id,
      name: product.name,
      price: product.price,
      categoryName: category.name,
      createdAt: product.createdAt,
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id));

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product Management</CardTitle>
          <Link href="/admin/product/create">
            <Button>Add Product</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.categoryName || 'N/A'}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.createdAt?.toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Link href={`/admin/product/${p.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <DeleteProductButton productId={p.id} />
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No products found. Create your first product to get started.
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

**Step 3: Commit**

```bash
git add x-app/app/admin/product/page.tsx
git commit -m "feat(admin): add product list page"
```

---

## Task 4: Create Delete Product Button (Client Component)

**Files:**
- Create: `x-app/app/admin/product/delete-product-button.tsx`

**Step 1: Create client component for delete**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteProductAction } from './actions';

export function DeleteProductButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const formData = new FormData();
    formData.append('productId', productId);

    try {
      await deleteProductAction(formData);
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Install dialog component**

Run: `cd x-app && npx shadcn@latest add dialog`
Expected: Dialog component added

**Step 3: Commit**

```bash
git add x-app/app/admin/product/delete-product-button.tsx
git commit -m "feat(admin): add delete product confirmation dialog"
```

---

## Task 5: Create Product Form Component

**Files:**
- Create: `x-app/app/admin/product/product-form.tsx`

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createProductAction, updateProductAction } from './actions';
import { useRouter } from 'next/navigation';

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  categoryId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  categories: { id: string; name: string }[];
  defaultValues?: ProductFormValues & { id?: string };
}

export function ProductForm({ categories, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      price: '0.00',
      categoryId: '',
    },
  });

  async function onSubmit(data: ProductFormValues) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', data.price);
    if (data.categoryId) formData.append('categoryId', data.categoryId);

    try {
      if (defaultValues?.id) {
        await updateProductAction(defaultValues.id, formData);
      } else {
        await createProductAction(formData);
      }
      router.push('/admin/product');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Saving...'
              : defaultValues?.id ? 'Update Product' : 'Create Product'
            }
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/product')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/admin/product/product-form.tsx
git commit -m "feat(admin): add product form component with validation"
```

---

## Task 6: Create Product Create Page

**Files:**
- Create: `x-app/app/admin/product/create/page.tsx`

**Step 1: Create create page**

```typescript
import { db } from '@/app/db/drizzle';
import { category } from '@/app/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '../product-form';

export default async function CreateProductPage() {
  // Fetch categories for dropdown
  const categories = await db.select({
    id: category.id,
    name: category.name,
  }).from(category);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/admin/product/create/page.tsx
git commit -m "feat(admin): add product create page"
```

---

## Task 7: Create Product Edit Page

**Files:**
- Create: `x-app/app/admin/product/[id]/page.tsx`

**Step 1: Create dynamic edit page**

```typescript
import { db } from '@/app/db/drizzle';
import { product, category } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '../product-form';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch product
  const [productData] = await db
    .select()
    .from(product)
    .where(eq(product.id, params.id));

  if (!productData) {
    notFound();
  }

  // Fetch categories
  const categories = await db.select({
    id: category.id,
    name: category.name,
  }).from(category);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories}
            defaultValues={{
              id: productData.id,
              name: productData.name,
              description: productData.description || '',
              price: productData.price,
              categoryId: productData.categoryId || undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Create not-found page**

Create: `x-app/app/admin/product/[id]/not-found.tsx`

```typescript
export default function NotFound() {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground">
          The product you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add x-app/app/admin/product/[id]/
git commit -m "feat(admin): add product edit page with not-found handling"
```

---

## Task 8: Add File Upload API Route

**Files:**
- Create: `x-app/app/api/upload/route.ts`
- Create: `x-app/public/uploads/.gitkeep`

**Step 1: Create uploads directory**

Run: `mkdir -p x-app/public/uploads && touch x-app/public/uploads/.gitkeep`

**Step 2: Create upload API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { db } from '@/app/db/drizzle';
import { file } from '@/app/db/schema';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!uploadedFile) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const filename = `${timestamp}-${uploadedFile.name}`;
    const filepath = join(process.cwd(), 'public/uploads', filename);

    // Write file to disk
    await writeFile(filepath, buffer);

    // Save file record to database
    const url = `/uploads/${filename}`;
    const [fileRecord] = await db.insert(file).values({
      name: uploadedFile.name,
      url,
      productId: productId || null,
    }).returning();

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      url
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

**Step 3: Update .gitignore**

Add to `x-app/.gitignore`:
```
/public/uploads/*
!/public/uploads/.gitkeep
```

**Step 4: Commit**

```bash
git add x-app/app/api/upload/route.ts x-app/public/uploads/.gitkeep x-app/.gitignore
git commit -m "feat(api): add file upload endpoint"
```

---

## Task 9: Add Image Upload to Product Form

**Files:**
- Modify: `x-app/app/admin/product/product-form.tsx`

**Step 1: Add image upload state and handler**

Add to ProductForm component (after the router declaration):

```typescript
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    if (defaultValues?.id) formData.append('productId', defaultValues.id);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setUploadedImages((prev) => [...prev, data.url]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }
```

**Step 2: Add image upload UI after category field**

```typescript
        <div className="space-y-2">
          <FormLabel>Product Images</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {uploadedImages.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>
```

**Step 3: Add React import at top**

```typescript
import { useState } from 'react';
```

**Step 4: Commit**

```bash
git add x-app/app/admin/product/product-form.tsx
git commit -m "feat(admin): add image upload to product form"
```

---

## Task 10: Create Admin Layout

**Files:**
- Create: `x-app/app/admin/layout.tsx`

**Step 1: Create admin layout with navigation**

```typescript
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <div className="flex gap-6">
              <Link
                href="/admin/product"
                className="text-sm hover:text-slate-900 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/admin/order"
                className="text-sm hover:text-slate-900 transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/admin/user"
                className="text-sm hover:text-slate-900 transition-colors"
              >
                Users
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add x-app/app/admin/layout.tsx
git commit -m "feat(admin): add admin layout with navigation"
```

---

## Verification Checklist

- [ ] Product list page shows all products
- [ ] Create product form works with validation
- [ ] Edit product form pre-fills data correctly
- [ ] Delete product shows confirmation dialog
- [ ] Image upload works and displays thumbnails
- [ ] Category dropdown populates correctly
- [ ] Form validation shows error messages
- [ ] Navigation between pages works smoothly

---

## Next Steps

1. Implement order management flow
2. Add user management
3. Build storefront product listing
4. Add search and filtering to product list
