# Modern Next.js Application

A production-ready Next.js application with TypeScript, featuring comprehensive examples of SSR, SSG, ISR, state management, and best practices.

## Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Zustand** for global client state
- **React Hook Form + Zod** for form validation
- **Vitest + React Testing Library** for unit/integration tests
- **Playwright** for E2E tests
- **GitHub Actions** for CI/CD
- **ESLint + Prettier** for code quality

## Project Structure

```
examples/next/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   ├── blog/                # Blog pages (SSG)
│   ├── dashboard/           # Dashboard pages (SSR)
│   ├── products/            # Products page (ISR)
│   ├── contact/             # Contact form
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── layouts/            # Layout components
│   ├── ui/                 # UI primitives (Button, Input, Card, etc.)
│   └── providers/          # Context providers
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and API client
├── store/                   # Zustand stores
├── types/                   # TypeScript types
├── __tests__/              # Unit tests
└── e2e/                    # E2E tests

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI

### Code Quality

This project uses:
- **ESLint** with Next.js config
- **Prettier** for code formatting
- **TypeScript** strict mode
- **Vitest** for unit testing
- **Playwright** for E2E testing

## Architecture

### Rendering Strategies

1. **SSR (Dashboard)**: Real-time data fetching on every request
2. **SSG (Blog)**: Pre-rendered at build time for optimal performance
3. **ISR (Products)**: Static with periodic regeneration (5 minutes)
4. **CSR (Contact)**: Client-side form with validation

### State Management

- **Global State**: Zustand for user and UI state
- **Server State**: React Query for API data with caching
- **Form State**: React Hook Form with Zod validation

### API Layer

- Custom API client with error handling
- Type-safe requests/responses
- Centralized error management

### Accessibility

- ARIA labels and roles
- Keyboard navigation
- Focus management
- Semantic HTML
- Screen reader support

### Performance Optimization

- Code splitting and lazy loading
- Image optimization with Next.js Image
- Memoization where appropriate
- Optimized bundle size

## Testing

### Unit Tests

Located in `__tests__/` directory:
- Component tests with React Testing Library
- Utility function tests

### E2E Tests

Located in `e2e/` directory:
- User flow tests with Playwright
- Cross-browser testing

## CI/CD

GitHub Actions workflow includes:
1. **Lint**: ESLint checks
2. **Type Check**: TypeScript compilation
3. **Unit Tests**: Vitest tests
4. **E2E Tests**: Playwright tests
5. **Build**: Production build

## Deployment

This application is ready to deploy to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** containers

### Vercel Deployment

```bash
vercel
```

## Best Practices

1. **Type Safety**: All code is fully typed with TypeScript
2. **Component Design**: Reusable, composable components
3. **Error Handling**: Comprehensive error boundaries and try-catch
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Performance**: Optimized for Core Web Vitals
6. **Testing**: High test coverage with unit and E2E tests
7. **Code Quality**: ESLint + Prettier + TypeScript strict mode
8. **Documentation**: Inline comments and comprehensive README

## License

MIT
