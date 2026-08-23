# Working in rosaura10

Personal project. Read `README.md` first — the intro sets the tone, and it is
deliberate: no rules, no conventions, no good practices. The rules below are the
exception, and they are about process, not about the work itself.

## Commits

Use Conventional Commits: `type(scope): description`, imperative mood, lowercase
except for proper nouns (Vite, Pages, Spanish).
Types in use here: `feat`, `fix`, `refactor`, `docs`, `chore`, `ci`.

**Never mention Claude, AI, or any assistant in a commit message.** No
`Co-Authored-By` trailers, no "generated with" footers, no tool names.

## Pull request descriptions

Exactly four sections, in this order, **one or two lines each — never more**:

- `## What` — what the change does
- `## Why` — the problem or reason behind it
- `## How` — the approach, briefly
- `## Notes` — anything the reviewer needs to know, or omit if there is nothing

**Never mention Claude, AI, or any assistant in a PR title or description.**

Titles follow the same Conventional Commits format as commits.

## Things worth knowing

- v1 and v2 are npm workspaces. Each has its own Vite base path and dev port
  (v1 → 5173, v2 → 5174); starting one does not start the other.
- Dev serves each version from the root. The `/rosaura10/<version>/` prefix only
  applies to builds, where it has to match GitHub Pages.
- Run `npm run serve` before pushing — it mounts `dist/` under `/rosaura10/`, and
  it is the only local check that the built base paths are right.
