# Agent frontmatter reference

Complete field reference for Claude Code agent (subagent) files. Source of truth:
https://code.claude.com/docs/en/sub-agents.md — re-check that page if anything here
seems stale or the user's Claude Code version predates a noted minimum.

## File anatomy

An agent is a Markdown file: YAML frontmatter (configuration) followed by a Markdown
body (the agent's system prompt). Only `name` and `description` are required.

## Locations and precedence

Higher rows win on name collisions:

| Location                       | Scope                | Precedence |
| ------------------------------ | -------------------- | ---------- |
| Managed settings `agents/` dir | Organization-managed | 1          |
| `--agents` CLI flag (JSON)     | Current session      | 2          |
| `.claude/agents/`              | Current project      | 3          |
| `~/.claude/agents/`            | All your projects    | 4          |
| Plugins                        | Where enabled        | 5          |

Both agent directories are scanned **recursively** — subfolders like
`agents/review/security.md` are fine for organization. Identity comes only from the
`name` frontmatter field, never from the file path or filename.

## Supported fields

| Field             | Required | Values / behavior when omitted |
| ----------------- | -------- | ------------------------------ |
| `name`            | Yes      | Unique identifier, lowercase letters and hyphens. Hooks receive it as `agent_type`. Filename need not match (but keeping them identical is good practice) |
| `description`     | Yes      | When Claude should delegate to this agent. Drives auto-delegation — be specific |
| `tools`           | No       | Allowlist of tools. **Omitted = inherits ALL parent tools.** To preload skills use `skills`, not `Skill` here |
| `disallowedTools` | No       | Denylist, removed from the inherited or specified list before `tools` is resolved |
| `model`           | No       | `sonnet`, `opus`, `haiku`, `fable`, a full model ID (e.g. `claude-opus-4-8`), or `inherit`. Default: `inherit` |
| `permissionMode`  | No       | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, or `manual` (alias for `default`, ≥ v2.1.200). Ignored for plugin agents |
| `maxTurns`        | No       | Maximum agentic turns before the agent stops |
| `skills`          | No       | Skills whose **full content** is preloaded into the agent's context at startup. Doesn't restrict access — unlisted skills remain invocable via the Skill tool |
| `mcpServers`      | No       | MCP servers for this agent: a name referencing an already-configured server, or an inline name → full server config. Ignored for plugin agents |
| `hooks`           | No       | Lifecycle hooks scoped to this agent: `PreToolUse`, `PostToolUse`, `Stop` (converted to `SubagentStop` when run as a subagent). Ignored for plugin agents |
| `memory`          | No       | Persistent cross-session memory: `user` (`~/.claude/agent-memory/<name>/`), `project` (`.claude/agent-memory/<name>/`, shareable via VCS), or `local` (`.claude/agent-memory-local/<name>/`, not for VCS) |
| `background`      | No       | `true` = always run as a background task. Unset = Claude chooses; as of v2.1.198 it backgrounds by default and goes foreground only when it needs the result immediately |
| `effort`          | No       | `low`, `medium`, `high`, `xhigh`, `max` (available levels depend on the model). Default: inherits the session effort |
| `isolation`       | No       | `worktree` = run in a temporary git worktree branched from the default branch (not the parent's HEAD); auto-cleaned if the agent makes no changes |
| `color`           | No       | Display color: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan` |
| `initialPrompt`   | No       | Auto-submitted first user turn — applies only when the agent runs as the **main session** agent (`--agent` flag or `agent` setting), not as a subagent |

## Critical mechanics

- **Tool inheritance:** omitting `tools` inherits every tool available to the parent,
  including MCP tools. Set it explicitly unless full inheritance is deliberate.
- **Resolution order:** `disallowedTools` is applied first, then `tools` is resolved
  against the remaining pool. A tool listed in both is removed. Both fields accept MCP
  server patterns: `mcp__<server>` or `mcp__<server>__*` matches every tool from that
  server; in `disallowedTools`, `mcp__*` removes all MCP tools.
- **Model resolution order:** `CLAUDE_CODE_SUBAGENT_MODEL` env var → per-invocation
  `model` parameter on the Agent tool → frontmatter `model` → inherit from the parent.
  Values excluded by an org `availableModels` allowlist are skipped.
- **Permission mode precedence:** a parent session in `bypassPermissions` or
  `acceptEdits` overrides the agent's `permissionMode`. A parent in auto mode is
  inherited and the frontmatter mode is ignored.
- **Tools subagents can never use** (they depend on the main conversation's UI/state,
  even if listed in `tools`): `AskUserQuestion`; `ExitPlanMode` unless the agent's
  `permissionMode` is `plan`.
- **Plugin agents** ignore `hooks`, `mcpServers`, and `permissionMode` for security.
  Copy the file into `.claude/agents/` or `~/.claude/agents/` if those are needed.
- **Nesting:** at most 5 subagent levels below the main conversation. An agent at
  depth 5 doesn't receive the Agent tool. Omit `Agent` from `tools` (or disallow it)
  to stop a specific agent from spawning others.
- **Context:** a subagent starts fresh — it gets its frontmatter-configured system
  prompt (the file body), basic environment details (cwd, platform), CLAUDE.md and
  git status, and the full content of any preloaded `skills`. It does not see the
  parent conversation, and within it `cd` doesn't persist between Bash calls.

## Live reload

Claude Code watches `.claude/agents/` and `~/.claude/agents/`: adding or editing a
file registers within a few seconds, no restart needed. Exception: the watcher only
covers directories that existed at session start, so a scope's **first** agent file
in a newly created `agents/` directory requires a session restart to load.
