import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/app/db/drizzle';
import { products } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { updateProductAction } from '../../actions';

export default async function EditProductPage({
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
        <h1 className="page-title">Edit Product</h1>
        <p className="page-description">Update product information</p>
      </div>

      <div className="card">
        <form action={updateProductAction.bind(null, params.id)}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              required
              defaultValue={productData.name}
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              defaultValue={productData.description || ''}
              placeholder="Enter product description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Price * ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              className="form-input"
              required
              step="0.01"
              min="0"
              defaultValue={productData.price}
              placeholder="0.00"
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary">
              Update Product
            </button>
            <Link href="/admin/products" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
