'use client';

import { deleteProductAction } from '../actions';

export function DeleteProductButton({ productId }: { productId: string }) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProductAction(productId);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="btn btn-danger"
      style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
    >
      Delete
    </button>
  );
}
