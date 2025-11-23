import { NextResponse } from 'next/server';
import type { Product } from '@/types';

const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with active noise cancellation',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Advanced fitness tracking and notifications on your wrist',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
    inStock: true,
    rating: 4.7,
    reviewCount: 256,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand for better posture',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category: 'Accessories',
    inStock: false,
    rating: 4.3,
    reviewCount: 89,
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with cherry MX switches',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
    category: 'Electronics',
    inStock: true,
    rating: 4.8,
    reviewCount: 342,
  },
];

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return NextResponse.json({
    data: products,
    meta: {
      total: products.length,
      page: 1,
      limit: 10,
    },
  });
}
