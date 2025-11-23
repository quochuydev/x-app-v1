import Image from 'next/image';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product, ApiResponse } from '@/types';

async function getProducts(): Promise<ApiResponse<Product[]>> {
  const res = await fetch('http://localhost:3000/api/products', {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export default async function ProductsPage() {
  const { data: products } = await getProducts();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Products
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover our latest collection of premium products
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {products.length} products (Updated every 5 minutes)
          </p>
          <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col transition-shadow hover:shadow-lg">
              <CardHeader className="p-0">
                <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Badge variant="danger" className="text-sm">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <Badge variant="info" className="mb-2">
                  {product.category}
                </Badge>
                <CardTitle className="mb-2 line-clamp-2 text-lg">
                  {product.name}
                </CardTitle>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {product.description}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount})
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4 pt-0">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <Button
                  variant={product.inStock ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Notify Me'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
