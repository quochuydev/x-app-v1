# PR Comment Handler Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a GitHub Action that responds to PR comments by executing commands and making code changes directly to the PR branch, limited to files already changed in the PR.

**Architecture:** The workflow triggers on `issue_comment` events filtered for PRs. It fetches PR metadata (changed files list), passes the comment text to Claude Code as a prompt with explicit constraints, and commits any changes back to the PR branch.

**Tech Stack:** GitHub Actions, `anthropics/claude-code-action@v1`, GitHub API, Bash scripting

---

## Task 1: Update Workflow Trigger and Validation

**Files:**
- Modify: `.github/workflows/claude-pr-review-comment.yml:1-28`

**Step 1: Update the workflow trigger**

Change from `pull_request_review_comment` to `issue_comment` to catch all PR comments:

```yaml
name: Claude PR Comment Handler

on:
  issue_comment:
    types: [created]
```

**Step 2: Update the job conditional**

Ensure the job only runs on PR comments (not issue comments):

```yaml
jobs:
  claude:
    if: github.event.issue.pull_request != null
    runs-on: ubuntu-latest
```

**Step 3: Update permissions**

The workflow needs write permissions to commit changes:

```yaml
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
```

**Step 4: Verify changes**

Run: `cat .github/workflows/claude-pr-review-comment.yml`
Expected: Shows updated trigger, conditional, and permissions

**Step 5: Commit**

```bash
git add .github/workflows/claude-pr-review-comment.yml
git commit -m "feat: update PR comment workflow trigger and permissions"
```

---

## Task 2: Add PR Metadata Collection

**Files:**
- Modify: `.github/workflows/claude-pr-review-comment.yml:18-28`

**Step 1: Add step to get PR number**

Add after the checkout step:

```yaml
      - name: Get PR details
        id: pr
        run: |
          PR_NUMBER=${{ github.event.issue.number }}
          echo "pr_number=$PR_NUMBER" >> $GITHUB_OUTPUT
          echo "Processing PR #$PR_NUMBER"
```

**Step 2: Add step to get PR branch and changed files**

```yaml
      - name: Get PR branch and changed files
        id: pr-info
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          PR_NUMBER=${{ steps.pr.outputs.pr_number }}

          # Get PR branch name
          PR_BRANCH=$(gh pr view $PR_NUMBER --json headRefName -q .headRefName)
          echo "branch=$PR_BRANCH" >> $GITHUB_OUTPUT
          echo "PR Branch: $PR_BRANCH"

          # Get list of changed files
          CHANGED_FILES=$(gh pr view $PR_NUMBER --json files -q '.files[].path' | tr '\n' ',' | sed 's/,$//')
          echo "changed_files=$CHANGED_FILES" >> $GITHUB_OUTPUT
          echo "Changed files: $CHANGED_FILES"
```

**Step 3: Add step to checkout PR branch**

Replace the existing checkout step:

```yaml
      - name: Checkout PR branch
        uses: actions/checkout@v5
        with:
          ref: ${{ steps.pr-info.outputs.branch }}
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
```

**Step 4: Verify changes**

Run: `cat .github/workflows/claude-pr-review-comment.yml | grep -A 20 "Get PR"`
Expected: Shows the new PR metadata collection steps

**Step 5: Commit**

```bash
git add .github/workflows/claude-pr-review-comment.yml
git commit -m "feat: add PR metadata collection and branch checkout"
```

---

## Task 3: Configure Claude Code Execution

**Files:**
- Modify: `.github/workflows/claude-pr-review-comment.yml:23-28`

**Step 1: Update Claude Code action with constrained prompt**

Replace the existing "Run Claude Code" step:

```yaml
      - name: Run Claude Code
        id: claude
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.ANTHROPIC_API_KEY }}
          show_full_output: false
          prompt: |
            You are responding to a PR comment request.

            **Context:**
            - PR Number: #${{ steps.pr.outputs.pr_number }}
            - Branch: ${{ steps.pr-info.outputs.branch }}
            - Changed files in this PR: ${{ steps.pr-info.outputs.changed_files }}

            **IMPORTANT CONSTRAINTS:**
            - You MUST only modify files that are in the changed files list above
            - Do NOT create new files
            - Do NOT modify files outside the PR scope
            - Focus on addressing the specific request in the comment

            **User Request:**
            ${{ github.event.comment.body }}

          claude_args: --dangerously-skip-permissions
```

**Step 2: Verify the updated step**

Run: `cat .github/workflows/claude-pr-review-comment.yml | grep -A 25 "Run Claude Code"`
Expected: Shows the Claude Code step with full context and constraints

**Step 3: Commit**

```bash
git add .github/workflows/claude-pr-review-comment.yml
git commit -m "feat: configure Claude Code with PR context and constraints"
```

---

## Task 4: Add Commit and Push Logic

**Files:**
- Modify: `.github/workflows/claude-pr-review-comment.yml` (add after Claude Code step)

**Step 1: Add git configuration step**

```yaml
      - name: Configure git
        if: success()
        run: |
          git config --global user.name "Claude Code Bot"
          git config --global user.email "claude-code-bot@anthropic.com"
```

**Step 2: Add commit and push step**

```yaml
      - name: Commit and push changes
        if: success()
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          # Check if there are any changes
          if [[ -n $(git status --porcelain) ]]; then
            git add .
            git commit -m "fix: apply changes from PR comment

            Requested by: @${{ github.event.comment.user.login }}
            Comment: ${{ github.event.issue.html_url }}#issuecomment-${{ github.event.comment.id }}

            🤖 Generated with Claude Code"

            git push origin ${{ steps.pr-info.outputs.branch }}
            echo "✅ Changes committed and pushed"
          else
            echo "ℹ️ No changes to commit"
          fi
```

**Step 3: Verify the new steps**

Run: `cat .github/workflows/claude-pr-review-comment.yml | grep -A 15 "Configure git"`
Expected: Shows git config and commit/push steps

**Step 4: Commit**

```bash
git add .github/workflows/claude-pr-review-comment.yml
git commit -m "feat: add git commit and push logic"
```

---

## Task 5: Add Response Comment

**Files:**
- Modify: `.github/workflows/claude-pr-review-comment.yml` (add after commit step)

**Step 1: Add success comment step**

```yaml
      - name: Post success comment
        if: success()
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh pr comment ${{ steps.pr.outputs.pr_number }} --body "✅ **Claude Code completed your request**

          Changes have been committed to the PR branch: \`${{ steps.pr-info.outputs.branch }}\`

          Review the changes and let me know if you need any adjustments!"
```

**Step 2: Add failure comment step**

```yaml
      - name: Post failure comment
        if: failure()
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh pr comment ${{ steps.pr.outputs.pr_number }} --body "❌ **Claude Code encountered an error**

          I wasn't able to complete your request. Please check the workflow logs for details:
          ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

**Step 3: Verify the comment steps**

Run: `cat .github/workflows/claude-pr-review-comment.yml | grep -A 10 "Post.*comment"`
Expected: Shows both success and failure comment steps

**Step 4: Commit**

```bash
git add .github/workflows/claude-pr-review-comment.yml
git commit -m "feat: add workflow status comments to PR"
```

---

## Task 6: Final Workflow Review and Testing

**Files:**
- Review: `.github/workflows/claude-pr-review-comment.yml`

**Step 1: Review complete workflow structure**

Run: `cat .github/workflows/claude-pr-review-comment.yml`
Expected: Complete workflow with all sections:
- Trigger: `issue_comment` with `created` type
- Job conditional: checks for PR
- Permissions: write access
- Steps: checkout, PR info, Claude Code, commit, comments

**Step 2: Validate YAML syntax**

Run: `yamllint .github/workflows/claude-pr-review-comment.yml || echo "Install yamllint to validate"`
Expected: No syntax errors (or skip if yamllint not installed)

**Step 3: Create test documentation**

Create: `docs/plans/2025-11-07-pr-comment-handler-testing.md`

```markdown
# PR Comment Handler Testing Guide

## How to Test

1. **Create a test PR** with some code changes
2. **Add a comment** to the PR with a request, for example:
   - "Fix the typo in the README"
   - "Add error handling to the validateInput function"
   - "Refactor the getUserData function to use async/await"
3. **Watch the workflow** run in Actions tab
4. **Verify** that changes are committed to the PR branch
5. **Check** that a success/failure comment is posted

## Expected Behavior

- ✅ Only modifies files that are already changed in the PR
- ✅ Commits changes with clear message
- ✅ Posts status comment back to PR
- ❌ Should NOT create new files
- ❌ Should NOT modify files outside PR scope

## Troubleshooting

- If workflow doesn't trigger: Check that comment is on a PR, not an issue
- If permission errors: Verify ANTHROPIC_API_KEY secret is set
- If commit fails: Check that GITHUB_TOKEN has write permissions
```

**Step 4: Verify test documentation**

Run: `cat docs/plans/2025-11-07-pr-comment-handler-testing.md`
Expected: Shows complete testing guide

**Step 5: Final commit**

```bash
git add docs/plans/2025-11-07-pr-comment-handler-testing.md
git commit -m "docs: add PR comment handler testing guide"
```

---

## Implementation Notes

**Key Design Decisions:**

1. **Trigger on `issue_comment`** - This is the correct event for PR comments in GitHub Actions (not `pull_request_review_comment` which is for review comments on specific code lines)

2. **Changed files constraint** - The workflow explicitly lists changed files in the prompt to Claude, with clear instructions to only modify those files. This prevents scope creep.

3. **Direct commits** - Changes are committed directly to the PR branch (option A from brainstorming), not as suggestions or separate commits requiring approval.

4. **Status feedback** - Success/failure comments keep the PR author informed without requiring them to check the Actions tab.

5. **Attribution** - Commit messages include who requested the change and link back to the comment for traceability.

**Security Considerations:**

- The workflow uses `GITHUB_TOKEN` which is automatically scoped to the repository
- `ANTHROPIC_API_KEY` must be configured as a repository secret
- Claude Code runs with `--dangerously-skip-permissions` to allow automated execution
- Constraints in the prompt help prevent unintended modifications

**Testing Strategy:**

- Manual testing via real PR comments (documented in testing guide)
- Verify scope constraints by requesting changes to files not in PR
- Test both success and failure scenarios
- Validate commit messages and status comments

---

## Post-Implementation

After completing all tasks:

1. **Push all commits** to your branch
2. **Create a test PR** to verify the workflow
3. **Document any issues** encountered during testing
4. **Update this plan** if implementation deviates from the design
