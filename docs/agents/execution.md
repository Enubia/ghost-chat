# Executing work: Subagent-Driven Development

This repo executes implementation work in-session with the
`subagent-driven-development` (SDD) skill. SDD is the *execution engine* — it
runs an already-agreed plan; it does not plan. Sharpen the design and break it
into tasks first, then hand the tasks to SDD.

## Task source

Either shape works here — use whichever a given piece of work produced:

- **Plan file.** One document with `## Task N` headings. SDD extracts each
  task's brief with its bundled `scripts/task-brief PLAN_FILE N`.
- **Agent-ready brief.** A self-contained task handed to the implementer
  verbatim — e.g. a GitHub issue body (issues are tracked via `gh`; see
  `docs/agents/issue-tracker.md`).

## How a run goes

1. Work on a feature branch or worktree — never `main` without consent.
2. Per task: dispatch a fresh implementer subagent (builds test-first via the
   `tdd` skill) → generate a diff package → dispatch a task reviewer (spec
   compliance + code quality) → loop fixes until clean → record the task in the
   progress ledger.
3. After all tasks: one whole-branch correctness/spec review, then finish
   (offer the maintainability pass, then merge/PR per repo conventions).

## Workspace

SDD's transient run artifacts — implementer reports, review packages, and the
`progress.md` ledger — live under `.scratch/sdd/`. That folder self-ignores, so
it never shows in `git status` or gets committed. It is the recovery map after
a context compaction: trust the ledger and `git log` over recollection.

## Domain docs

This repo has a `CONTEXT.md` (domain glossary) at the root — reviewers and
implementers read it for the area they touch and use that vocabulary. There is
no `docs/adr/` yet; if one is added later, treat decisions it records as
settled and don't re-litigate them.
