---
name: build-agent
description: Guide for creating a new Claude Code agent (subagent) or updating an existing one — a .md file in .claude/agents/ or ~/.claude/agents/. Use when the user asks to add, build, create, modify, rename, or tune an agent/subagent, or asks how to define one. Covers frontmatter fields, tool scoping, auto-delegation descriptions, and verification.
argument-hint: "[create|update] [agent name or what the agent should do]"
---

# Build or update a Claude Code agent

The deliverable is a single Markdown file: YAML frontmatter that configures the
agent, followed by a body that becomes the agent's system prompt. A subagent
receives only that body plus basic environment details, CLAUDE.md, and git
status — not the parent conversation and not the full Claude Code system prompt,
so the body must stand alone.

Agents are discovered from (highest precedence first): managed settings →
`--agents` CLI flag → project `.claude/agents/` → user `~/.claude/agents/` →
plugins. Both directories are scanned recursively; an agent's identity is its
`name` frontmatter field (lowercase + hyphens), never its file path.

Follow the steps in order. Full field spec: `references/frontmatter.md`.
Starter archetypes: `references/patterns.md`.

## Step 1 — Survey and classify

List existing agents in both scopes before writing anything:

```bash
ls -R .claude/agents/ ~/.claude/agents/ 2>/dev/null
```

This determines two things:

- **Mode.** If an agent with the target name (or clearly the same purpose)
  already exists, this is an **update** — read the existing file in full first
  and go to Step 4. Never overwrite an agent you haven't read.
- **Collisions.** A new agent's `name` must not collide with an existing one in
  either scope; project beats user on collisions, which can silently shadow.

Decide scope: **project** (`.claude/agents/`, shared with the team via version
control) or **user** (`~/.claude/agents/`, personal, available in every
project). Default to project when working in a repository.

## Step 2 — Gather requirements

Close open questions with **one** batched `AskUserQuestion` call (max 4
questions). Skip any question the request already answers; skip the call
entirely if nothing is open. Draw from this bank:

- **Single responsibility** — what is the agent's one job? Official best
  practice is focused agents, not jack-of-all-trades; if the request bundles
  several jobs, propose splitting.
- **Trigger conditions** — when should Claude delegate to it? This feeds the
  `description` directly.
- **Tool needs** — read-only? edits files? runs commands? searches the web?
  spawns other agents? This feeds the `tools` allowlist.
- **Model/effort** — inherit from the session (the default), or pin a specific
  model or effort level?

## Step 3 — Draft the agent file

Read `references/frontmatter.md` for the complete field spec, and
`references/patterns.md` if an archetype matches. Hard rules:

- **`name`** (required): lowercase letters and hyphens. The spec doesn't
  require the filename to match, but keep them identical so the file is
  findable.
- **`description`** (required): state what the agent does AND when to delegate
  to it — Claude reads this to decide when to hand off, so specificity here is
  what makes auto-delegation work. Include "use proactively …" phrasing when
  the agent should fire without being asked.
- **`tools`**: omitting it inherits **all** parent tools, including MCP tools.
  Always set it explicitly unless full inheritance is a deliberate, stated
  choice. Grant the minimum: reviewers and researchers get read-only tools.
  Use `disallowedTools` for subtractive scoping (it is applied before `tools`).
- **Everything else** (`model`, `permissionMode`, `effort`, `memory`,
  `isolation`, `background`, `maxTurns`, `skills`, `mcpServers`, `hooks`,
  `color`, `initialPrompt`) is optional — add a field only when the requirement
  demands it. Defaults are in the reference.
- **Body = the system prompt.** Structure it as: role statement, how to work,
  scope and limits, output format. Subagents have no user channel
  (`AskUserQuestion` doesn't work) — instruct the agent to state assumptions
  and complete the task, and to return results inline in its final message,
  since only that message reaches the caller.

## Step 4 — Update mode: diff before writing

When modifying an existing agent:

1. State the intended change as a before/after summary and confirm it matches
   what was asked. Preserve all behavior the request didn't touch.
2. Whenever body behavior changes, re-check the `description` — if it no longer
   matches what the agent does, delegation breaks silently. Re-sync it.
3. A rename changes the file AND the `name` field together, then grep other
   agents, docs, and hook configs for the old name — hook matchers and
   orchestrator allowlists target `name` and go stale on rename.

## Step 5 — Verify

Live reload: Claude Code watches both agent directories, so edits register
within a few seconds — but the **first** agent file in a brand-new `agents/`
directory needs a session restart, because the watcher only covers directories
that existed at session start.

Run this chain:

1. **Static check** against the Step 3 rules: YAML parses; `name` is
   lowercase-and-hyphens; `description` states both job and trigger; `tools`
   is explicit and minimal (or inheritance was deliberately chosen).
2. **Live check**: spawn the agent via the Agent tool with a representative
   test prompt. Confirm it stays in scope, respects its tool limits, and
   returns the expected output format. If the spawn is rejected as an unknown
   agent type right after creating a first-ever agent file, that's the restart
   artifact above, not a defect — tell the user to restart.
3. **If a live check isn't possible**, hand the user a ready-to-paste test
   prompt plus pass criteria, and say exactly which checks did run.

Never claim the agent works if it was never exercised.
