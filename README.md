## Workflow

BA/Dev create a issue [feature_request.md] -> Issue title / Issue description:

Project board:

- Change issue status - Planning (-> Webhook server (x-github-app) -> Dispatch to runner)
  -> Trigger runner
  -> Create new branch
  -> Create plan (/write-plans)
  -> Review in Issue comment -> Update plan
- Change issue status - Coding
  -> Trigger runner
  -> Create PR
  -> Run execute plan (/execute-plans) (-> Webhook server (x-github-app) -> Dispatch to runner)
  -> Commit and push to current branch
  -> Review in PR comment -> Update code
- Change issue status - Done
  -> Merge PR
  -> Close issue

## Source structure

x-base-app/
├── be/
│ ├── index.ts
│ ├── package.json
│ ├── tsconfig.json
│ ├── .env # Environment variables
│ ├── .env.example
│ ├── config.ts
│ ├── routes/ # All API routes and controllers
│ │ ├── admin.users.ts
│ │ └── admin.products.ts
│ │
│ ├── services/ # Business logic / services layer
│ │ ├── admin.user.service.ts
│ │ └── admin.product.service.ts
│ │ └── public.user.service.ts
│ │ └── public.product.service.ts
│ │
│ ├── db/ # Database models (Drizzle)
│ │
│ ├── drizzle/ # Database models (Drizzle)
│ │
│ ├── middlewares/
│ │ ├── auth.ts
│ │ ├── logger.ts
│ │ └── errorHandler.ts
│ │
│ ├── utils/ # Helper functions, constants
│ │ ├── validation.ts
│ │ └── logger.ts
│ │
│ ├── tests/ # Unit & integration tests
│ │
│ ├── types/ # Type definitions
│ │ └── index.ts

## Command

```sh
(cd be && repomix --style markdown)
```
