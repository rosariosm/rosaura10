---
name: nueva-rama
description: Start a new branch of rosaura10 in its own git worktree under .worktrees/, with dependencies installed, the private plans linked and free dev/serve ports. Use when the user asks for a new branch ("nueva rama", "hacelo en una rama nueva", "en otro worktree") or to work on a feature in parallel with another branch.
---

# New branch in a worktree

Each branch lives in its own folder under `.worktrees/`, so work on one branch never touches another.

## 1. Name the branch

`type/short-name`, lowercase with hyphens. Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `ci`.
Ask if the name or type is not clear. The folder is the branch name with `/` replaced by `-`.

## 2. Create the worktree

From the main checkout (`git rev-parse --path-format=absolute --git-common-dir` points to its `.git`):

```sh
ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
BRANCH=feat/example
DIR="$ROOT/.worktrees/${BRANCH//\//-}"
git -C "$ROOT" fetch origin
git -C "$ROOT" worktree add "$DIR" -b "$BRANCH" origin/master
```

- Base is `origin/master` unless the user names another branch (for example `feat/color`).
- If the branch already exists, drop `-b` and its start point: `git -C "$ROOT" worktree add "$DIR" "$BRANCH"`.
- If `$DIR` already exists, reuse it.

## 3. Link the private plans

`docs/plan-*.md` is gitignored, so it is not in the new worktree. Link it so there is only one copy:

```sh
mkdir -p "$DIR/docs"
for f in "$ROOT"/docs/plan-*.md; do ln -sfn "$f" "$DIR/docs/$(basename "$f")"; done
```

## 4. Install dependencies

`node_modules` is not shared between worktrees:

```sh
npm install --prefix "$DIR"
```

## 5. Pick free ports

Dev ports (v1 5173, v2 5174) use `strictPort`, and `npm run serve` uses 4173. Add 100 per worktree and check it is free:

```sh
lsof -i :5274 -i :4273
npm run dev:v2 -- --port 5274
PORT=4273 npm run serve
```

## 6. Work there

Run every command inside `$DIR`, with absolute paths. Tell the user the folder and the URLs.

## Rules

- Commit and push only when the user asks.
- Never merge into `master` or publish without being asked: every push to `master` deploys to GitHub Pages.
- Follow `CLAUDE.md`: Conventional Commits, no code comments, never mention Claude or AI.
- Run `npm run serve` (with the worktree's `PORT`) before pushing.

## Finish

When the branch is merged or dropped:

```sh
git -C "$ROOT" worktree remove "$DIR"
git -C "$ROOT" worktree prune
```

If there are uncommitted changes, `remove` refuses: tell the user instead of using `--force`. Delete the branch only if the user asks.
