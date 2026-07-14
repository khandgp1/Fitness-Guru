# Implementation plan — `capture-session` skill

**Status:** approved — all open questions resolved 2026-07-14. Not yet built.

## Goal

A project-level skill, invoked at the end of a session, that captures the
conversation into `prompt_history/`:

1. A **full transcript** of the conversation (markdown, timestamped filename).
2. An **LLM-chat-optimized version** of the session, written to be loaded
   into future chats like this one (markdown, same timestamp).
3. An updated **index** file so future sessions can discover the history.

Designed to be transferable to any project: the skill contains no
Fitness-Guru-specific references and derives everything from the project it
runs in.

## Decisions locked in from the interview

| Decision | Choice |
|---|---|
| Skill location | Project-level: `.claude/skills/capture-session/SKILL.md`, written portably so the folder can be copied into any project |
| Target folder | `prompt_history/` (underscore — the hyphen in the original ask was a typo). Reuse it where it exists; create it if it doesn't |
| Full transcripts | Go in a `prompt_history/full/` sub-folder, since they'll rarely be opened |
| Trigger | **Only** the `/capture-session` slash command. Not natural-language requests, not wrap-up vibes, never automatic |

Follow-up review resolved the remaining choices:

| Decision | Choice |
|---|---|
| Timestamp format | `YYYY-MM-DD_HHMM`, e.g. `2026-07-14_1435` — unique across same-day sessions, sorts chronologically, no counter lookup. Time comes from the `date` command at capture, never guessed |
| Optimized-file suffix | `_chat` |
| Legacy journal files | Ignored entirely — `INDEX.md` never mentions `2026-07-09.md` / `2026-07-10.md`; they just remain in the folder untouched |

## Resulting folder layout

```
prompt_history/
├── INDEX.md                      ← one line per captured session
├── 2026-07-09.md                 ← legacy manual prompt journals — untouched
├── 2026-07-10.md                 ←   (not indexed, not migrated)
├── 2026-07-14_1435_chat.md       ← LLM-optimized capture (primary artifact)
└── full/
    └── 2026-07-14_1435_full.md   ← full transcript
```

The `_chat` / `_full` suffixes keep the new files visually distinct from your
existing date-only journal files and make each file self-identifying even
when moved.

## The skill file — `.claude/skills/capture-session/SKILL.md`

Modeled on `coaching-session` (same discipline, same transcript-fidelity
rules) but generic and capture-only. Sections:

### Frontmatter

- `name: capture-session`
- `description`: states plainly that this skill fires **only** on the
  `/capture-session` command — it must instruct Claude *not* to trigger it
  from natural-language requests or wrap-up language. (The description is
  what Claude reads when deciding to auto-invoke, so the restriction lives
  there, not just in the body.)

### Step 1 — Locate or create the folder

- Look for `prompt_history/` at the project root (the session's primary
  working directory). Also accept `prompt-history/` if that's what a project
  already has — use whichever exists; create `prompt_history/` (plus `full/`)
  if neither does.
- Pre-existing files in the folder that the skill didn't create are left
  alone and never rewritten or indexed.

### Step 2 — Compute the timestamp

- Run `date +%Y-%m-%d_%H%M` once; reuse the value for both filenames and the
  index line. On the (rare) collision with an existing capture from the same
  minute, bump the minute suffix rather than overwrite.

### Step 3 — Write the full transcript → `full/<TS>_full.md`

Borrow coaching-session's fidelity rules verbatim in spirit:

- Reconstructed clean User/Assistant dialogue from the session's own context.
- Every turn's actual content — scripts, tables, numbers, quoted wording —
  reproduced, never described ("gave an intro script" is a failure).
- Substantive content that arrived via tool results (e.g. subagent reports)
  is part of the exchange and preserved; only tool-call mechanics and system
  reminders are dropped.
- Spans lost to context compaction are explicitly marked as reconstructed
  from summary, never silently paraphrased.
- Header: date, time, project name (derived from the working directory).

### Step 4 — Write the chat-optimized version → `<TS>_chat.md`

Written for a future AI chat to onboard cold, not for a human skimming:

- What the session was about and where things ended up.
- Decisions made and their rationale; anything explicitly rejected.
- Concrete state: files created/changed, commands, numbers, names.
- Open threads / next steps.
- Ends with: `Full transcript: full/<TS>_full.md`.
- Explicit contrast rule from coaching-session: if the chat file and the full
  transcript read like two zoom levels of the same summary, the full file is
  wrong.

### Step 5 — Update `INDEX.md`

- Create with a one-line header if missing.
- Append one line:
  `<TS> — <one-sentence summary> — chat: <TS>_chat.md · full: full/<TS>_full.md`
- The index is the only discovery mechanism for future sessions — the skill
  states this so it's never skipped.

### Step 6 — Confirm

- Report to the user exactly what was written and where. No other side
  effects — this skill never touches plans, agents, or anything outside
  `prompt_history/`.

## Deliberately out of scope (vs. coaching-session)

- **No plan-update step** — capture only.
- **No start-of-session loading step.** The chat files are built *to be
  loaded* into future sessions, but this skill doesn't do the loading. If
  you want a companion load behavior later (e.g. `/capture-session load`),
  that's a follow-up decision.
- **No migration** of the two legacy journal files.

## Build steps (once plan is approved)

1. Create `.claude/skills/capture-session/SKILL.md` per the spec above.
2. Create `prompt_history/full/` (the folder itself; `.gitkeep` if we want it
   committed empty).
3. Verify: run `/capture-session` in a real session and check all three
   artifacts land correctly; confirm the skill does **not** trigger on "save
   this session" phrasing.
