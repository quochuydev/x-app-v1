import { NextRequest, NextResponse } from 'next/server';
import { db } from '../db/drizzle';
import { todos } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const todoList = await db.select().from(todos).orderBy(todos.createdAt);
    return NextResponse.json(todoList);
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
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const [newTodo] = await db.insert(todos)
      .values({ content: content.trim() })
      .returning();

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}