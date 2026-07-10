---
name: build-physique-agent
description: Build or update an agent for the physique-guru team in this project — a new specialist, changes to nutritionist or resistance-training, or physique-guru routing changes. Use whenever an agent request touches the physique-guru system; layers this project's team conventions on top of the generic build-agent skill.
argument-hint: "[create|update] [specialist name or domain]"
---

# Build or update a physique-guru team agent

This project runs a closed three-agent system: `physique-guru`
(`.claude/agents/physique-guru.md`) orchestrates an explicit allowlist of
specialists (`nutritionist`, `resistance-training`). A team change is never one
file: every specialist must honor the shared contract the guru's procedures
depend on, and the guru hard-codes the roster in several places. This skill
owns those project rules — and nothing generic. Generic agent mechanics
(frontmatter spec, tool scoping, naming, verification) belong to the
`build-agent` skill, which this skill always runs on top of.

Work through the steps in order.

## Step 1 — Classify the request

Decide which mode this is; it determines which references apply:

- **(a) New specialist** — apply `references/specialist-contract.md` AND
  `references/guru-sync.md`.
- **(b) Update an existing specialist** — apply `references/specialist-contract.md`;
  apply `references/guru-sync.md` if the specialist's name, domain coverage, or
  report format changes.
- **(c) Guru-only change** (routing, voice, procedure) — apply
  `references/guru-sync.md` in reverse: confirm the guru's assumptions still
  match what the specialists actually emit.

## Step 2 — Plan first

Unless already in plan mode or the change is a pure typo fix, call
`EnterPlanMode` (the /plan flow) before touching any file. The plan must treat
the specialist file and the physique-guru sync (Step 5) as **one change set** —
a plan that creates a specialist without the guru updates is incomplete, because
the guru's allowlist makes an unlisted specialist unreachable.

## Step 3 — Ensure build-agent is loaded

If the `build-agent` skill's instructions are not already in context this
session, invoke it now via the Skill tool (`skill: build-agent`). Follow its
steps for surveying existing agents, frontmatter, drafting, update-mode
diffing, and verification. Do not restate or override its rules here — this
skill only adds the project deltas below.

## Step 4 — Apply the specialist contract

Read `references/specialist-contract.md` and enforce every requirement on the
new or updated specialist. The contract is not style preference: the guru's
operating procedure depends on it (no-intake dispatch assumes specialists
default-and-flag; the refinement round keys on the literal **"To refine"**
marker; synthesis assumes inline-only, evidence-cited reports). A specialist
that drifts from the contract breaks the guru silently.

## Step 5 — Guru sync pass

Read `references/guru-sync.md` and update `physique-guru.md` at every
touchpoint it lists, in the same change set as the specialist file. Adding a
specialist whose domain appears in the guru's out-of-scope examples means
removing it from that decline list, or the guru will refuse work its own team
now covers.

## Step 6 — Verify end-to-end

Run build-agent's verification first, then add the project-level routing test:

1. Spawn `physique-guru` via the Agent tool with a prompt squarely in the
   new/changed specialist's domain. Confirm the guru dispatches that specialist
   (not another, and not a refusal).
2. Check the specialist's report honors the contract format — direct answer
   first, stated assumptions, a "To refine" section only when something
   material is missing.
3. Probe with a still-out-of-scope request (e.g., medical diagnosis) and
   confirm the guru still declines it.

If a live test isn't possible (fresh skill/agent directory needing a session
restart), hand the user ready-to-paste test prompts with these pass criteria
and say exactly which checks did run. Never claim done on static checks alone.
