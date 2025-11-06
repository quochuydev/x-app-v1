import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { DeleteProductButton } from '../components/DeleteProductButton';

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, params.id))
    .limit(1);

  if (!product || product.length === 0) {
    notFound();
  }

  const productData = product[0];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{productData.name}</h1>
        <p className="page-description">Product Details</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            Description
          </h3>
          <p>{productData.description || 'No description provided'}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            Price
          </h3>
          <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2563eb' }}>
            ${productData.price}
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            Product ID
          </h3>
          <p style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{productData.id}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            Timestamps
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            Created: {productData.createdAt ? new Date(productData.createdAt).toLocaleString() : 'N/A'}
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Updated: {productData.updatedAt ? new Date(productData.updatedAt).toLocaleString() : 'N/A'}
          </p>
        </div>

        <div className="actions">
          <Link href={`/admin/products/${productData.id}/edit`} className="btn btn-primary">
            Edit Product
          </Link>
          <Link href="/admin/products" className="btn btn-secondary">
            Back to List
          </Link>
          <DeleteProductButton productId={productData.id} />
        </div>
      </div>
    </div>
  );
}
