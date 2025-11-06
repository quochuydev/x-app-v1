import Link from 'next/link';
import { createProductAction } from '../actions';

export default function NewProductPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create Product</h1>
        <p className="page-description">Add a new product to your catalog</p>
      </div>

      <div className="card">
        <form action={createProductAction}>
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
              placeholder="0.00"
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn btn-primary">
              Create Product
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
