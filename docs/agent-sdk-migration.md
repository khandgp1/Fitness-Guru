# Agent SDK Migration Playbook: Claude Agent SDK → Claude API SDK

## Purpose

This is a general playbook for deciding when and how to move an agent system off the **Claude Agent SDK** (Claude Code packaged as a library — what powers `.claude/agents` subagents today) and onto the **Claude API SDK** (`anthropic` / `@anthropic-ai/sdk`), specifically to use the **Tool Runner** (`client.beta.messages.tool_runner`).

These are two different products with different harnesses:

| | Claude Agent SDK (current) | Claude API SDK + Tool Runner (future, if triggered) |
|---|---|---|
| What it is | Claude Code repackaged as a library | A thin helper over `POST /v1/messages` |
| Subagents | Auto-discovered from `.claude/agents/*.md` | No concept of subagents — you compose it yourself (e.g. a custom tool whose `run()` makes its own nested Messages API / Tool Runner call) |
| Built-in tools | Read/Write/Edit/Bash/Grep/Glob/WebSearch/WebFetch | None — every tool is one you define |
| Agent loop | Provided, fixed | Provided, but only loops over tools you supply |

They are not mutually exclusive — this doc treats the move as **incremental and trigger-driven**, not a wholesale cutover.

## Current State

Agents are defined as `.claude/agents/*.md` files with YAML frontmatter (`tools:` allow-list) and a system-prompt body, auto-discovered and dispatched by the Claude Agent SDK's built-in harness. This project's agents (`physique-guru`, `nutritionist`, `resistance-training`) are the concrete example: a coordinator dispatches to two specialists via the `Agent` tool, each specialist scoped to a narrow tool set.

This remains the default. No migration work is planned unless the trigger below is hit.

## Migration Trigger

**Move to the Claude API SDK when a concrete need for the Tool Runner shows up** — e.g., composing custom tools with fine-grained per-turn hooks (approval gates, result interception, retries) that the Agent SDK's fixed harness doesn't expose, or building a tool-calling loop that isn't shaped like a Claude Code session at all.

This is deliberately narrower than "productionizing the app" or "wanting Managed Agents" — those are different triggers with different destinations (see Alternatives, below). Don't migrate speculatively; wait until a specific capability gap in the Agent SDK is blocking something.

## What Gets Lost — Claude Agent SDK Benefits to Reimplement

Everything below is free with the Claude Agent SDK today. Moving a component to the Claude API SDK means picking up the cost of reimplementing whichever of these it actually relies on:

| Capability | What the Agent SDK gives you | What replaces it on the API SDK |
|---|---|---|
| Built-in tools | Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch — ready to use | Define each as a custom tool with its own JSON schema and `run()` implementation, or drop the ones you don't need |
| Subagent discovery & routing | Drop a `.md` file in `.claude/agents/`, it's auto-available and dispatched by description | Hand-roll delegation: a custom tool whose `run()` makes a nested `client.messages.create()` / Tool Runner call with its own system prompt and tools |
| Per-agent permissions | `tools:` frontmatter allow-list, interactive permission prompts | Your own gating logic inside each tool's `run()` function |
| Context management | Automatic compaction, conversation state across turns | Manage message history yourself; optionally adopt the beta compaction feature directly |
| Hooks / settings.json | `PreToolUse`/`PostToolUse` hooks, declarative settings | Tool Runner's per-turn hooks (approval, interception, result modification) — available, but you wire each one up explicitly |
| CLI/session UX | Streaming terminal output, `AskUserQuestion`, plan mode, permission prompts | Your own UI/output layer — none of this ships with the API SDK |
| MCP integration | Configured declaratively, auto-wired | Reconnect MCP servers yourself (Python ships conversion helpers; other languages more manual) |
| Persistent memory | Auto memory system under `~/.claude/projects` | No equivalent — build your own storage/retrieval if the use case needs it |

## What Stays the Same

The underlying model access, tool-use protocol (schema → `tool_use` block → `tool_result`), and the ability to keep a specialist-delegation architecture are unaffected — only the harness providing them changes. A migrated component can keep the same conceptual shape (coordinator + fixed specialist roster) it has today.

## Phased Approach

1. **Stay on the Agent SDK** until the Tool Runner trigger materializes on a specific component — don't migrate preemptively.
2. **Scope the migration to the component that needs it**, not the whole system. The Agent SDK and API SDK can coexist — e.g., one subagent could shell out (via its existing `Bash` tool) to a script that itself uses the API SDK with Tool Runner, without touching the rest of the agent set.
3. **Reimplement only what that component actually uses** from the table above — most components won't need all of it (e.g., a narrow specialist with no filesystem access doesn't need Read/Write/Edit reimplemented).
4. **Expand incrementally** if more components hit the same trigger, rather than committing to a full cutover up front.

## Alternatives Ruled Out

- **Productionizing into a deployed app** is a different trigger pointing at either continuing with the Agent SDK (it's a real library, deployable outside the CLI) or Managed Agents (if you want Anthropic to host the loop and sandbox) — not automatically a reason to hand-roll the API SDK.
- **Managed Agents** is the right destination if the future need is long-running/async sessions or not wanting to host infrastructure yourself — a separate decision from wanting Tool Runner. See the earlier interview in this project's history (short-duration, fixed-specialist-roster tasks favored the Tool Runner path over Managed Agents) for the reasoning framework.
