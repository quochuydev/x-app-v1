import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }

    // Clear out the todos for the (public) demo
    // Because you can't trust an open <input> on the internet
    const { db } = await import('@/app/db/drizzle');
    const { todos } = await import('@/app/db/schema');

    await db.delete(todos);
    revalidatePath('/db');

    return NextResponse.json({ message: 'All todos deleted successfully' });
  } catch (error) {
    console.error('Error clearing todos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear todos' },
      { status: 500 }
    );
  }
}
