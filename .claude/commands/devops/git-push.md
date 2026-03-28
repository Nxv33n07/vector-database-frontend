---
name: git-push
description: Stage all changes, commit with a message, and push to the remote GitHub repository
---

Stage all changes, create a commit, and push to the current branch on GitHub.

If the user provided arguments after `/git-push`, use that text as the commit message. Otherwise, run `git diff --stat HEAD` (or `git status`) to summarize the changes and generate a concise, descriptive commit message from that summary.

## Steps

1. Run `git status` to see what files are changed or untracked.
2. Run `git add .` to stage everything.
3. Commit using the message:
   - If `$ARGUMENTS` is non-empty, use it as-is.
   - Otherwise, inspect `git diff --cached --stat` and write a short conventional-style message (e.g. `feat: add query page filters`).
4. Run `git push` to push to the tracked remote branch.
5. Report the commit hash and branch that was pushed.

## Post-Push: Merge Conflict Check

6. Check for merge conflicts with `main` by running:
   ```
   git fetch origin
   git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main
   ```
   - If conflicts are detected: post a comment on the branch (via `gh pr comment` if a PR exists, otherwise output a clear warning) listing the conflicting files. **Stop here — do not raise a PR.**
   - If no conflicts: proceed to step 7.

## Post-Push: Auto PR to Main

7. If the current branch is not `main`:
   - Check if a PR already exists from this branch to `main` (`gh pr list --head <branch> --base main`).
   - If no PR exists: create one using `gh pr create --base main` with a title and body summarising the commits in this branch vs main (`git log main..HEAD --oneline`).
   - Merge the PR using `gh pr merge <number> --merge`.
   - Report the PR URL and merge commit.

## Post-Push: Upstream PR (Forks Only)

8. Check if an upstream remote exists:
   ```
   git remote -v
   ```
   - If an `upstream` remote is present (i.e. this repo is a fork):
     - Check if a PR already exists from `origin/<branch>` to `upstream/main` using `gh pr list` against the upstream repo.
     - If none exists: create a cross-repo PR using `gh pr create --repo <upstream-owner>/<upstream-repo> --head <your-username>:<branch> --base main` with the same summary.
     - Report the upstream PR URL.
