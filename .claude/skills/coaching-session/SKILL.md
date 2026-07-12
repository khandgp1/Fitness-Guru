---
name: coaching-session
description: Manage continuity across iterative physique-coaching sessions built with the physique-guru agent. Use at the start of any coaching-program conversation to load prior context (existing plan + session history). Use explicitly — via /coaching-session end, or an unambiguous user request to end/save/log the session — to capture this session's log and, separately, ask whether to update the coaching plan. Never infer the end-of-session capture from vague wrap-up language alone.
argument-hint: "[end]"
---

# Coaching session continuity

This project runs an iterative, multi-session physique coaching program through
the `physique-guru` agent (`.claude/agents/physique-guru.md`, backed by
`nutritionist` and `resistance-training`). Each session is a conversation
between the user and this session's Claude; `physique-guru` and its
specialists remain inline-only per their own contracts — this skill does not
change that. All persistence happens at this level, in `coaching_program/`.

## Layout of `coaching_program/`

- `plan/coaching_plan.md` — the actual coaching program (goals, training,
  nutrition, progress). Starts as a single file. If it later outgrows one
  file, that's a decision to make with the user when it comes up — propose it
  explicitly and agree on the resulting structure together at that time.
  Nothing about the eventual split (how many files, how it's divided) is
  decided yet — don't assume it, and don't default to any particular shape
  (e.g. mirroring the nutritionist/resistance-training divide). Edited in
  place on every update — no archived copies of prior versions are kept as
  separate files — and stamped at the top with `Last updated: <DATE>_<NNN>`
  (see Step 4).
- `sessions/INDEX.md` — one line per past session (sequence, date, one-sentence
  summary, links to that session's full + distilled files). This is the only
  mechanism by which a future session with no memory of this one learns that
  history exists at all — keep it current whenever a session is captured.
- `sessions/<DATE>_<NNN>_full.md` — reconstructed full dialogue transcript of
  one session.
- `sessions/<DATE>_<NNN>_distilled.md` — condensed version of that session,
  written for a future AI chat to onboard quickly, ending with a pointer back
  to the full transcript.

`NNN` is a zero-padded 3-digit sequence number that increments globally across
all sessions ever captured (not reset per day) — determine it by checking the
highest existing `NNN` under `sessions/` and adding one. Pair it with today's
date: `<DATE>_<NNN>`, e.g. `2026-07-19_007`. This identifier is shared: compute
it once per session, the first time either Step 3 or Step 4 needs it, and
reuse the same value for the other if both happen in the same session — this
is what lets the plan's revision stamp trace directly to the session that
produced it, even if that session's log and plan update aren't both written
at once.

## Step 1 — Start of session: load continuity (read-only, no permission needed)

At the start of any coaching-program conversation:

1. Check whether `coaching_program/` exists. If not, this is session 1 —
   proceed with no history to load.
2. If it exists, read the plan file(s) under `plan/` and `sessions/INDEX.md`.
3. Briefly orient the user: state the plan's current state in a sentence or
   two and how many past sessions exist. Do not dump full past transcripts
   unprompted — open a specific `_full.md` only if the current discussion
   needs detail the distilled summary and plan don't already give you.

## Step 2 — During the session

Work the coaching program normally — dispatch `physique-guru` per its own
operating procedure, iterate with the user. This skill only manages what gets
persisted around that work, not how physique-guru is used.

## Step 3 — Ending a session: capture the log

Trigger this step ONLY on one of:

- The user runs `/coaching-session end`, or
- The user unambiguously asks to end/save/log the session in so many words
  ("let's end the session," "save this session," "log this chat").

Do NOT trigger on general wrap-up language ("ok I think we're good," "thanks,"
the conversation trailing off) — that is not a request to capture anything.

When triggered, the trigger itself is the permission for this step (no
separate confirmation needed) — proceed directly:

1. Reconstruct the full session as a clean User/Assistant dialogue from your
   own context. "Full" means every user and assistant turn appears with its
   actual content — tables, scripts, numbers, and quoted wording reproduced as
   they were delivered, never described or paraphrased ("gave an intro script"
   is a failure; the script itself belongs in the transcript). Content that
   reached the conversation through tool results — e.g. physique-guru or
   specialist reports — is part of the exchange and is preserved the same way;
   the only things dropped are tool-call mechanics and system reminders.
   Summarizing is the distilled file's job (step 4), not this one's: if the
   full and distilled files read like two zoom levels of the same summary, the
   full file is wrong. If part of the session is no longer available verbatim
   in your context (e.g. it was compacted), mark that span explicitly in the
   transcript as reconstructed from summary rather than silently paraphrasing
   it.
2. Compute `<DATE>_<NNN>` as described above.
3. Write `sessions/<DATE>_<NNN>_full.md`: a header with the date and session
   number, then the reconstructed dialogue in full.
4. Write `sessions/<DATE>_<NNN>_distilled.md`: condensed to what a future AI
   chat actually needs to pick this up cold — decisions made, numbers/targets
   agreed, open questions, what changed versus the prior session. End with a
   line: `Full transcript: sessions/<DATE>_<NNN>_full.md`.
5. Append one line to `sessions/INDEX.md` (create it, with a one-line header,
   if this is the first session): `<DATE>_<NNN> — <one-sentence summary> —
   full: sessions/<DATE>_<NNN>_full.md · distilled:
   sessions/<DATE>_<NNN>_distilled.md`.
6. Confirm to the user what was written and where.

## Step 4 — Coaching plan update (separate permission, independent of Step 3)

Not every session changes the plan — do not assume it does just because a log
was captured.

1. Ask the user directly and plainly: should the coaching plan be updated with
   what this session covered? Proceed only on a clear yes.
2. On a clear yes, do NOT edit `plan/coaching_plan.md` yet. First write the
   proposed changes to `plan/proposed_update.md` — a self-contained, readable
   account of exactly what will change in the coaching plan: which sections, the
   old → new content, and why. Write it to be opened and read in a markdown
   viewer, not scanned in the terminal. Tell the user the file path and ask them
   to review it there. This is a scratch review artifact — do not index it in
   `sessions/INDEX.md` or otherwise treat it as part of the persisted program
   record.
3. Iterate on `plan/proposed_update.md` in place against the user's feedback
   until they approve the proposed changes.
4. On approval, apply them to the coaching plan:
   - If `plan/coaching_plan.md` doesn't exist yet, create it. If it exists, edit
     it in place with the approved changes — don't rewrite sections the session
     didn't touch. This overwrites the previous version; no separate archived
     copy is kept.
   - Update the `Last updated: <DATE>_<NNN>` line at the top of the file to this
     session's identifier (compute or reuse it as described above).
   - Delete `plan/proposed_update.md` — once the coaching plan is updated, the
     review artifact has served its purpose and is not kept.
5. If the plan has grown large or unwieldy as a single file, raise that with
   the user and work out a split structure together at that point — don't
   assume any particular shape in advance, and don't split without agreement.
