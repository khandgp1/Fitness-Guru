---
name: capture-session
description: Capture the current conversation into the project's prompt_history folder — a full transcript, an LLM-chat-optimized version for loading into future sessions, and an updated index. Trigger ONLY when the user runs the /capture-session command. Never trigger from natural-language requests ("save this session", "log this chat"), wrap-up language, or the conversation ending — without the explicit command, do nothing.
---

# Capture session

Captures the current conversation as durable markdown files so future AI
sessions can pick up where this one left off. This skill is
project-agnostic: it references nothing outside the project it runs in, and
the whole skill folder can be copied into any other project unchanged.

It is capture-only. It never loads history, never edits plans or other
project files, and has no side effects outside the prompt-history folder.

## Trigger — command only

Run this skill ONLY when the user invokes `/capture-session`. Do NOT run it
because the user asked in prose to save/log/capture the session, because the
conversation seems to be wrapping up, or for any other reason. If the user
asks in prose, point them to `/capture-session` instead of running the
capture.

The command itself is the permission — once invoked, proceed through all
steps without asking for further confirmation.

## Step 1 — Locate or create the folder

At the project root (the session's primary working directory), look for
`prompt_history/`; also accept `prompt-history/` if the project already has
that spelling. Use whichever exists. If neither exists, create
`prompt_history/`. Ensure a `full/` sub-folder exists inside it.

Files already in the folder that this skill didn't create (e.g. manual
notes) are left completely alone: never rewritten, renamed, migrated, or
referenced from the index.

## Step 2 — Compute the timestamp

Run `date +%Y-%m-%d_%H%M` once and reuse the value (`<TS>`) for both
filenames and the index line. Never guess or reconstruct the time from
context. If a capture with the same `<TS>` already exists, bump the minute
by one until the name is free — never overwrite an existing capture.

## Step 3 — Full transcript → `full/<TS>_full.md`

Reconstruct the entire session as a clean User/Assistant dialogue from your
own context:

- Header first: date, time, and the project name (derived from the working
  directory), plus a one-line topic.
- "Full" means every user and assistant turn appears with its actual
  content — code, tables, scripts, numbers, and quoted wording reproduced as
  they were delivered, never described or paraphrased ("gave an intro
  script" is a failure; the script itself belongs in the transcript).
- Substantive content that reached the conversation through tool results
  (e.g. subagent reports, file contents that were discussed) is part of the
  exchange and is preserved the same way. Only tool-call mechanics and
  system reminders are dropped.
- If part of the session is no longer available verbatim in your context
  (e.g. it was compacted), mark that span explicitly in the transcript as
  reconstructed from summary — never silently paraphrase it.

Summarizing is the chat file's job (Step 4), not this one's: if the full and
chat files read like two zoom levels of the same summary, the full file is
wrong.

## Step 4 — Chat-optimized version → `<TS>_chat.md`

Written for a future AI chat to onboard cold, not for a human skimming:

- What the session was about and where things ended up.
- Decisions made and their rationale; anything explicitly rejected.
- Concrete state: files created or changed, commands run, numbers, names.
- Open threads and next steps.
- End with a line: `Full transcript: full/<TS>_full.md`.

## Step 5 — Update the index

Append one line to `INDEX.md` in the prompt-history folder (create it with a
one-line header if missing):

```
<TS> — <one-sentence summary> — chat: <TS>_chat.md · full: full/<TS>_full.md
```

The index is the only mechanism by which a future session discovers that
this history exists — never skip this step.

## Step 6 — Confirm

Tell the user exactly what was written and where: the three file paths and
the one-sentence summary used in the index.
