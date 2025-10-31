import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { todos } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { content, completed } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    const updateData: Partial<{ content: string; completed: boolean }> = {};

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim() === '') {
        return NextResponse.json(
          { error: 'Content must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return NextResponse.json(
          { error: 'Completed must be a boolean' },
          { status: 400 }
        );
      }
      updateData.completed = completed;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedTodo = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();

    if (updatedTodo.length === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTodo[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid todo ID' },
        { status: 400 }
      );
    }

    const deletedTodo = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning();

    if (deletedTodo.length === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}