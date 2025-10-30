'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/app/db/drizzle';
import { todos } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function addTodoAction(formData: FormData) {
  try {
    const content = formData.get('content') as string;

    if (!content || content.trim().length === 0) {
      throw new Error('Todo content cannot be empty');
    }

    if (content.length > 255) {
      throw new Error('Todo content cannot exceed 255 characters');
    }

    await db.insert(todos).values({ content: content.trim() });
    revalidatePath('/db');

    return { success: true, message: 'Todo added successfully' };
  } catch (error) {
    console.error('Error adding todo:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add todo'
    };
  }
}

export async function deleteTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;

    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid todo ID');
    }

    await db.delete(todos).where(eq(todos.id, Number(id)));
    revalidatePath('/db');

    return { success: true, message: 'Todo deleted successfully' };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete todo'
    };
  }
}

export async function toggleTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const completed = formData.get('completed') === 'true';

    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid todo ID');
    }

    await db
      .update(todos)
      .set({ completed: !completed })
      .where(eq(todos.id, Number(id)));
    revalidatePath('/db');

    return { success: true, message: `Todo marked as ${!completed ? 'completed' : 'incomplete'}` };
  } catch (error) {
    console.error('Error toggling todo:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to toggle todo'
    };
  }
}

export async function editTodoAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const content = formData.get('content') as string;

    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid todo ID');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Todo content cannot be empty');
    }

    if (content.length > 255) {
      throw new Error('Todo content cannot exceed 255 characters');
    }

    await db
      .update(todos)
      .set({ content: content.trim() })
      .where(eq(todos.id, Number(id)));
    revalidatePath('/db');

    return { success: true, message: 'Todo updated successfully' };
  } catch (error) {
    console.error('Error editing todo:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to edit todo'
    };
  }
}
