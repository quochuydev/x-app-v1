BA/Dev create a issue -> Issue title / Issue description: Technical documents

Project board:

- Change issue status - Planning (-> Webhook server -> Dispatch to runner)
  -> Trigger runner
  -> Create new branch
  -> Create plan (/write-plans)
  -> Review in Issue comment -> Update plan
- Change issue status - Coding
  -> Trigger runner
  -> Create PR
  -> Run execute plan (/execute-plans) (-> Webhook server -> Dispatch to runner)
  -> Commit and push to current branch
  -> Review in PR comment -> Update code
- Change issue status - Done
  -> Merge PR
  -> Close issue
