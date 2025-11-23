import { NextResponse } from 'next/server';
import type { DashboardStats } from '@/types';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const stats: DashboardStats = {
    totalUsers: 12458,
    totalRevenue: 384920,
    totalOrders: 1847,
    conversionRate: 3.24,
  };

  return NextResponse.json(stats);
}
