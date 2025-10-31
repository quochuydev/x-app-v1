'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function addTodoAction(formData: FormData) {
  const content = formData.get('content') as string;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Database not configured');
    }

    const { db } = await import('./drizzle');
    const { todos } = await import('./schema');

    await db.insert(todos).values({ content });
    revalidatePath('/db');
  } catch (error) {
    console.error('Error adding todo:', error);
    // In production, you might want to throw this error to display to user
    // For now, we'll just log it
  }
}

export async function deleteTodoAction(formData: FormData) {
  const id = formData.get('id') as string;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Database not configured');
    }

    const { db } = await import('./drizzle');
    const { todos } = await import('./schema');

    await db.delete(todos).where(eq(todos.id, Number(id)));
    revalidatePath('/db');
  } catch (error) {
    console.error('Error deleting todo:', error);
    // In production, you might want to throw this error to display to user
    // For now, we'll just log it
  }
}
