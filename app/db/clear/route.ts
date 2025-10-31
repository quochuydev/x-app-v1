import { NextResponse } from 'next/server';

export async function POST() {
  // Database functionality has been removed
  // This endpoint is kept for compatibility but no longer performs database operations
  return NextResponse.json({ message: 'Database functionality has been removed' });
}
