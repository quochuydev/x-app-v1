import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { todos } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allTodos = await db.select().from(todos).orderBy(todos.createdAt);
    return NextResponse.json(allTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const newTodo = await db
      .insert(todos)
      .values({
        content: content.trim(),
        completed: false,
      })
      .returning();

    return NextResponse.json(newTodo[0], { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}