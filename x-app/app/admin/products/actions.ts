'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function createProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;

  if (!name || !price) {
    throw new Error('Name and price are required');
  }

  await db.insert(products).values({
    name,
    description,
    price,
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProductAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;

  if (!name || !price) {
    throw new Error('Name and price are required');
  }

  await db
    .update(products)
    .set({
      name,
      description,
      price,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  redirect('/admin/products');
}

export async function deleteProductAction(id: string) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/admin/products');
  redirect('/admin/products');
}
