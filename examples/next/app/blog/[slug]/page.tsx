import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AppLayout } from '@/components/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Post, ApiResponse } from '@/types';

async function getPosts(): Promise<ApiResponse<Post[]>> {
  const res = await fetch('http://localhost:3000/api/posts', {
    next: { revalidate: false },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  return res.json();
}

async function getPost(slug: string): Promise<Post | null> {
  const { data: posts } = await getPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export async function generateStaticParams() {
  const { data: posts } = await getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <AppLayout>
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-8">
            ← Back to Blog
          </Button>
        </Link>

        {post.coverImage && (
          <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="info">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-4">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-500">
                {formatDate(post.publishedAt)} · 5 min read
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600">{post.excerpt}</p>
          <div className="mt-8">
            <p>
              This is where the full blog post content would be rendered. In a real application,
              you would use a markdown parser or rich text editor output here.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <h2>Key Takeaways</h2>
            <ul>
              <li>Learn modern development practices</li>
              <li>Build scalable applications</li>
              <li>Improve code quality and maintainability</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="mb-4 text-2xl font-bold">About the Author</h2>
          <div className="flex items-center gap-4">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{post.author.name}</p>
              <p className="text-gray-600">{post.author.email}</p>
            </div>
          </div>
        </div>
      </article>
    </AppLayout>
  );
}
