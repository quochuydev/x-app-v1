import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getDashboardStats() {
  const res = await fetch('http://localhost:3000/api/dashboard/stats', {
    next: { revalidate: 60 },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  
  return res.json();
}

async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        trend={{ value: 12.5, isPositive: true }}
      />
      <StatsCard
        title="Total Revenue"
        value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`}
        icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        trend={{ value: 8.2, isPositive: true }}
      />
      <StatsCard
        title="Total Orders"
        value={stats.totalOrders.toLocaleString()}
        icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        trend={{ value: 3.1, isPositive: false }}
      />
      <StatsCard
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        trend={{ value: 5.4, isPositive: true }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex h-32 items-center justify-center">
                    <LoadingSpinner />
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <DashboardStats />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Activity {i + 1}</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-gray-200" />
                      <div>
                        <p className="text-sm font-medium">Product {i + 1}</p>
                        <p className="text-xs text-gray-500">${(i + 1) * 99} sold</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {(5 - i) * 234} sales
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
