import Link from 'next/link';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    title: 'Server-Side Rendering',
    description: 'Dynamic pages with SSR for real-time data and SEO optimization',
    icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  },
  {
    title: 'Static Generation',
    description: 'Ultra-fast pages pre-rendered at build time for optimal performance',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Incremental Regeneration',
    description: 'Update static content without rebuilding the entire site',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    title: 'Type Safety',
    description: 'Full TypeScript support with strict type checking',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'State Management',
    description: 'Zustand and React Query for efficient global and server state',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  },
  {
    title: 'Accessibility First',
    description: 'ARIA labels, keyboard navigation, and semantic HTML throughout',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
];

export default function Home() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Modern Next.js Application
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Production-ready boilerplate with TypeScript, React Query, Zustand, and comprehensive examples
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button variant="primary" size="lg" asChild>
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/blog">Read Blog</Link>
            </Button>
          </div>
        </section>

        <section className="py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Features & Best Practices
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16">
          <Card className="bg-blue-50">
            <CardContent className="flex flex-col items-center justify-between gap-6 p-12 md:flex-row">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Explore our examples and see how to build production-ready applications.
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="primary" size="lg" asChild>
                  <Link href="/products">View Products</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
