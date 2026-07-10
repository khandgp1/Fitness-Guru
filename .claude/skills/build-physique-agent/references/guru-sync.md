# Physique-guru sync checklist

`physique-guru.md` (`.claude/agents/physique-guru.md`) hard-codes its team.
Any change to the roster — adding, renaming, removing, or materially
re-scoping a specialist — must update every touchpoint below **in the same
change set**, or the guru will either refuse to dispatch the new specialist
(allowlist miss) or decline work its team now covers (stale out-of-scope
list).

Anchor texts below are quoted as of 2026-07-10; if one doesn't match, the guru
file changed — re-read it in full before editing, and update this checklist.

## Touchpoints

1. **Frontmatter `description`** — names the specialists: "orchestrates the
   nutritionist and resistance-training specialists". Add/remove names so
   top-level delegation stays accurate.

2. **"## Your team" roster** — "You have exactly two specialists" plus the
   numbered list where each entry is `**name**` followed by its domain
   summary. Update the count and add a numbered entry whose domain summary
   matches the specialist's `description`.

3. **Allowlist paragraph** — "You may use ONLY these two agents. No other
   agent type … SendMessage may only target a nutritionist or
   resistance-training agent that you spawned". Update both the count phrasing
   and the SendMessage target list. This is the hard gate: a specialist
   missing here is unreachable no matter what the roster says.

4. **Step 1 alignment gate** — the per-specialist routing bullets ("Component
   covered by X → dispatch X") need a bullet for the new specialist, AND the
   out-of-scope examples list ("cardio programming, yoga, mobility work,
   physical therapy, medical diagnosis, mental health, injury treatment,
   etc.") must drop any example the new specialist now covers. This is the
   easiest touchpoint to miss and the most damaging: the guru will decline
   work its own team handles.

5. **Step 4 refinement round** — keys on the specialists' literal **"To
   refine"** marker and says "Batch the questions across both specialists".
   Fix the "both" phrasing when the team size changes; if the contract's
   marker ever changes, this step changes with it.

6. **Residual team-of-two phrasings** — grep the whole file for `two`, `both`,
   and each specialist name to catch anything the sections above missed
   (e.g., step 3's dispatch examples "send the training component to
   resistance-training and the nutrition component to nutritionist").

## Rename / removal

`build-agent` Step 4.3 already mandates grepping for the old name on a rename;
the concrete targets in this project are `physique-guru.md` (all touchpoints
above) and this skill's own references. On removal, also consider whether the
removed domain belongs back in the Step 1 out-of-scope examples list.

## Reverse check (guru-only edits)

When editing only `physique-guru.md`, verify its assumptions still match the
live specialists: the roster domain summaries against each specialist's
`description`, the "To refine" marker against the specialists' report format,
and the no-intake dispatch policy against the specialists'
assume-and-flag protocol.
