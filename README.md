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

```
x-base-app/
├── be/
│ ├── package.json
│ ├── tsconfig.json
│ ├── .gitignore
│ ├── .env
│ ├── .env.example
│ │
│ ├── index.ts
│ ├── config.ts
│ │
│ ├── middlewares/
│ │ ├── api.admin.auth.adapt.ts
│ │
│ ├── routes/ # All API routes && middleware
│ │ └── api.{area}.{resource}.{action}.ts
│ │
│ ├── tests/
│ │ ├── api.admin.auth.spec.ts
│ │ ├── api.admin.auth.fixture.ts
│ │
│ ├── utils/ # Helper functions, constants, service
│ │ ├── stripe.service.ts (example)
│ │ └── logger.utils.ts
│ │
│ ├── db/ # Database models (Drizzle)
│ │
│ ├── drizzle/ # Database migrations (Drizzle)
│ │
│ ├── types/ # Type definitions
│ │ └── index.ts
```

## Command

```sh
# v4
(cd be && repomix --style markdown)
```
