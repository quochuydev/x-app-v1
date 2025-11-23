import { NextResponse } from 'next/server';
import type { Post } from '@/types';

const posts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js 15',
    slug: 'getting-started-nextjs-15',
    excerpt: 'Learn how to build modern web applications with Next.js 15, featuring improved performance and new capabilities.',
    content: 'Full content would go here...',
    author: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      role: 'admin',
    },
    publishedAt: '2024-01-15',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    tags: ['nextjs', 'react', 'tutorial'],
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    slug: 'typescript-best-practices',
    excerpt: 'Discover essential TypeScript patterns and practices for building robust applications.',
    content: 'Full content would go here...',
    author: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      role: 'user',
    },
    publishedAt: '2024-01-10',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    tags: ['typescript', 'javascript', 'best-practices'],
  },
  {
    id: '3',
    title: 'Building Accessible UIs',
    slug: 'building-accessible-uis',
    excerpt: 'A comprehensive guide to creating accessible user interfaces with ARIA and semantic HTML.',
    content: 'Full content would go here...',
    author: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      role: 'admin',
    },
    publishedAt: '2024-01-05',
    coverImage: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
    tags: ['accessibility', 'ui', 'a11y'],
  },
];

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    data: posts,
    meta: {
      total: posts.length,
      page: 1,
      limit: 10,
    },
  });
}
