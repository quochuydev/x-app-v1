BA/Dev create a issue -> Issue title / Issue description / Issue comments: Technical documents
Project board:

- Change issue status - Planning (-> Webhook server -> Dispatch to runner)
  -> Trigger runner
  -> Create new branch -> Create PR
  -> Create coding plan (/superpower:write-plan): Review in Local or PR (comment)
- Change issue status - Coding
  -> Trigger runner run claude code (-> Webhook server -> Dispatch to runner)
  -> Commit to current branch
