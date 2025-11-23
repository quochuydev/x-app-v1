# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
examples/next/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── dashboard/stats/     # Dashboard statistics endpoint
│   │   ├── posts/               # Blog posts endpoint
│   │   └── products/            # Products endpoint
│   ├── blog/                    # Blog pages (SSG)
│   │   ├── [slug]/              # Individual blog post (SSG)
│   │   └── page.tsx             # Blog list page
│   ├── dashboard/               # Dashboard pages (SSR)
│   │   └── page.tsx             # Main dashboard
│   ├── products/                # Products page (ISR)
│   │   └── page.tsx             # Products list with ISR
│   ├── contact/                 # Contact page (CSR)
│   │   └── page.tsx             # Contact form
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── dashboard/               # Dashboard-specific components
│   │   └── stats-card.tsx       # Statistics card component
│   ├── layouts/                 # Layout components
│   │   ├── app-layout.tsx       # Main app layout (header + footer)
│   │   ├── dashboard-layout.tsx # Dashboard layout (header + sidebar)
│   │   ├── header.tsx           # Global header
│   │   ├── footer.tsx           # Global footer
│   │   └── sidebar.tsx          # Dashboard sidebar
│   ├── performance/             # Performance optimization components
│   │   ├── lazy-image.tsx       # Memoized lazy loading image
│   │   └── optimized-list.tsx   # Optimized list rendering
│   ├── providers/               # Context providers
│   │   └── query-provider.tsx   # React Query provider
│   └── ui/                      # UI primitives
│       ├── badge.tsx            # Badge component
│       ├── button.tsx           # Button with variants
│       ├── card.tsx             # Card and subcomponents
│       ├── input.tsx            # Input with validation display
│       ├── loading-spinner.tsx  # Loading indicator
│       └── modal.tsx            # Modal dialog with a11y
│
├── hooks/                        # Custom React hooks
│   ├── use-dashboard-stats.ts   # Dashboard data fetching
│   ├── use-posts.ts             # Blog posts fetching
│   └── use-products.ts          # Products fetching
│
├── lib/                          # Utilities and libraries
│   ├── api-client.ts            # Type-safe API client with error handling
│   └── utils.ts                 # Helper functions (cn, formatDate, debounce)
│
├── store/                        # Zustand stores
│   ├── use-ui-store.ts          # UI state (sidebar, theme)
│   └── use-user-store.ts        # User state with persistence
│
├── types/                        # TypeScript types
│   └── index.ts                 # Shared types and interfaces
│
├── __tests__/                    # Unit/Integration tests
│   ├── components/
│   │   └── button.test.tsx      # Button component tests
│   └── lib/
│       └── utils.test.ts        # Utility function tests
│
└── e2e/                          # End-to-end tests
    ├── contact.spec.ts          # Contact form E2E tests
    └── home.spec.ts             # Home page E2E tests
```

## Key Technologies

### Core
- **Next.js 16**: App Router, Server Components, Route Handlers
- **React 19**: Latest React with Server Components
- **TypeScript**: Full type safety

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **CSS Modules**: For component-specific styles

### State Management
- **Zustand**: Global client state (user, UI)
- **React Query**: Server state with caching and invalidation
- **React Hook Form**: Form state with validation

### Validation
- **Zod**: Runtime type validation and schema validation

### Testing
- **Vitest**: Unit test runner
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

### Code Quality
- **ESLint**: Linting with Next.js config
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled

## Rendering Strategies

### SSR (Server-Side Rendering)
Used for: **Dashboard**
- Renders on every request
- Fresh data on each page load
- Good for dynamic, user-specific content

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const stats = await getDashboardStats(); // Fetches on every request
  return <div>{/* Render stats */}</div>;
}
```

### SSG (Static Site Generation)
Used for: **Blog**
- Pre-rendered at build time
- Fastest performance
- Good for content that doesn't change often

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

### ISR (Incremental Static Regeneration)
Used for: **Products**
- Static with periodic updates
- Balance between performance and freshness
- Revalidates every 5 minutes

```typescript
// app/products/page.tsx
async function getProducts() {
  const res = await fetch('...', {
    next: { revalidate: 300 }, // 5 minutes
  });
  return res.json();
}
```

### CSR (Client-Side Rendering)
Used for: **Contact Form**
- Rendered on client
- Good for interactive forms
- Uses 'use client' directive

```typescript
// app/contact/page.tsx
'use client';
export default function ContactPage() {
  const { register, handleSubmit } = useForm();
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

## State Management Patterns

### Global State (Zustand)
```typescript
// store/use-user-store.ts
export const useUserStore = create()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: 'user-storage' }
  )
);
```

### Server State (React Query)
```typescript
// hooks/use-products.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products'),
  });
}
```

### Form State (React Hook Form + Zod)
```typescript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

## API Routes

All API routes are in `app/api/`:
- `/api/dashboard/stats` - Dashboard statistics
- `/api/posts` - Blog posts list
- `/api/products` - Products list

Example:
```typescript
// app/api/posts/route.ts
export async function GET() {
  const posts = await fetchPosts();
  return NextResponse.json({ data: posts });
}
```

## Performance Optimizations

### 1. Code Splitting
- Automatic with Next.js App Router
- Dynamic imports for heavy components

### 2. Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="..."
  width={400}
  height={300}
  loading="lazy"
/>
```

### 3. Memoization
```typescript
const MemoizedComponent = React.memo(Component);
const memoizedValue = React.useMemo(() => expensiveCalc(), [dep]);
const memoizedCallback = React.useCallback(() => {...}, [dep]);
```

### 4. Package Optimization
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['@/components/ui'],
}
```

## Accessibility Features

### ARIA Labels
```typescript
<button aria-label="Close modal">
  <X />
</button>
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus management in modals
- Tab order follows visual order

### Semantic HTML
- Proper heading hierarchy
- Semantic tags (nav, main, article, etc.)
- Form labels and descriptions

### Screen Reader Support
```typescript
<span className="sr-only">Loading...</span>
```

## Testing

### Unit Tests
```bash
npm test                 # Run tests once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

### E2E Tests
```bash
npm run test:e2e         # Headless
npm run test:e2e:ui      # With UI
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Common Tasks

### Adding a New Page
1. Create file in `app/[route]/page.tsx`
2. Choose rendering strategy (SSR/SSG/ISR/CSR)
3. Add to navigation in `components/layouts/header.tsx`

### Adding a New Component
1. Create in `components/[category]/[name].tsx`
2. Export from component file
3. Write tests in `__tests__/components/[name].test.tsx`

### Adding a New API Route
1. Create in `app/api/[route]/route.ts`
2. Implement GET/POST/etc handlers
3. Add types to `types/index.ts`
4. Create hook in `hooks/use-[feature].ts`

### Adding New State
1. Create store in `store/use-[feature]-store.ts`
2. Use in components: `const value = useStore((state) => state.value)`

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Setup
- Set environment variables in deployment platform
- Configure domains and SSL
- Enable preview deployments for PRs

## Troubleshooting

### Build Errors
- Check TypeScript errors: `npx tsc --noEmit`
- Clear cache: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

### Test Failures
- Update snapshots: `npm test -- -u`
- Check browser versions for E2E
- Verify test database/API is running

### Performance Issues
- Analyze bundle: `npm run build --analyze`
- Check Network tab for large assets
- Profile with React DevTools

## Best Practices

1. **Always use TypeScript types**
2. **Test components with unit tests**
3. **Use semantic HTML**
4. **Add ARIA labels for accessibility**
5. **Optimize images with Next.js Image**
6. **Use React Query for server data**
7. **Memoize expensive computations**
8. **Follow ESLint/Prettier rules**
9. **Write meaningful commit messages**
10. **Keep components small and focused**
