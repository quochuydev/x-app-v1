import Link from 'next/link';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';
import { sql } from 'drizzle-orm';

export default async function AdminDashboard() {
  const productCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);

  const count = productCount[0]?.count || 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Welcome to the admin panel</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            Total Products
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: '600', color: '#2563eb' }}>
            {count}
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            Orders
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: '600', color: '#64748b' }}>
            Coming Soon
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            Users
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: '600', color: '#64748b' }}>
            Coming Soon
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admin/products/new" className="btn btn-primary">
            Create Product
          </Link>
          <Link href="/admin/products" className="btn btn-secondary">
            View Products
          </Link>
        </div>
      </div>
    </div>
  );
}
