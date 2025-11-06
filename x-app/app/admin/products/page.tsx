import Link from 'next/link';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';
import { desc } from 'drizzle-orm';
import { DeleteProductButton } from './components/DeleteProductButton';

export default async function ProductsPage() {
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-description">Manage your product catalog</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>All Products</h2>
          <Link href="/admin/products/new" className="btn btn-primary">
            Add Product
          </Link>
        </div>

        {allProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products yet</h3>
            <p>Get started by creating your first product</p>
            <Link href="/admin/products/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create Product
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.description || '-'}</td>
                    <td>${product.price}</td>
                    <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="actions">
                        <Link href={`/admin/products/${product.id}`} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                          View
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                          Edit
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
