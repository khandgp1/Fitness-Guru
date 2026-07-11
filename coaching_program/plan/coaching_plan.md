# Coaching Plan

Last updated: 2026-07-11_001

## Philosophy

Consistency is the delivery mechanism. No process is possible without it.

### Hierarchy

1. **Adherence** — do it, repeatedly, for a long time
2. **Progression** — make it harder over time
3. **Optimization** — the exact split, macros, exercise selection

Coaching should be engineered for adherence, not for theoretical optimality.

## Phase 1 — The Daily GM Foundation

The coaching process starts simple. The client needs to check in every morning:
**GM**. Every day, for a period **not disclosed to the client**. This teaches
consistency without belief in a timeline expectation.

Do it in the morning.

### Why daily GMs for an undisclosed period

1. Timelines can be gamed
2. Timelines are audited
3. Timelines are inherently not forever — so it never becomes who you are
4. Filters clients, because it's something that literally is never too hard

### Coach behavior

- **Reply to every GM.** 🫡
- On missed days, **pull them back gracefully**: "day missed, GM today, keep going."

### Intro message to the client (and it's true)

> "Here's how we start. Every morning, you send me one thing: GM. That's it. No
> numbers, no length. You're not counting down to anything, because the people
> who get this body and keep it don't count down to anything. They just show up.
> This is me finding out if you're one of them before I build you something that
> assumes you are. Miss a day? You send GM the next day and we keep going. The
> streak isn't the point. Showing back up is."

### Stacking

When adding the next layer, add **one** thing, and keep the GM. Don't replace the
ritual — build on top of it. You're stacking.

## Instrumentation

### What the coach tracks (raw, per client)

All timestamps in the client's local timezone; a "day" is their local calendar day.

| Signal | Definition |
|---|---|
| `gm_today` | Did a GM arrive this calendar day? (binary) |
| `gm_time` | Timestamp of the GM |
| `prompted` | Did the coach send any nudge/reminder before it arrived? (binary) |
| `first_gm_date` | Date of the very first GM (starts tenure clock) |

Everything below is derived from those four.

### Definitions (so the coach never has to interpret)

- **Miss** — a calendar day ends with no GM.
- **Clean recovery** — a miss immediately followed by an unprompted GM the next day.
- **Lapse** — 2 consecutive missed days.
- **Ghost** — 3+ consecutive missed days.
- **Unprompted GM** — arrived with zero coach nudge in the prior 24h.
- **Anchor window** — the median `gm_time` over the trailing 10 GMs.

## Graduation gate: Phase 1 → Phase 2

The coach advances the client (stacks the first new behavior) **only when ALL four
hold**. Any one failing = hold in Phase 1.

| # | Criterion | Objective threshold |
|---|---|---|
| **G1 — Tenure** | Enough time to be a habit, not novelty | ≥ 14 days since `first_gm_date` |
| **G2 — Consistency** | Shows up nearly every day | ≤ 2 misses in trailing 14 days (≥85% adherence) |
| **G3 — Autonomy** | Runs without the coach | 0 prompted GMs in trailing 10 days |
| **G4 — Anchoring** | It's reflex, not a daily decision | All trailing-10 GMs within ±3h of the anchor |

## Two hard rules that bind the coach

1. **Never advance early to be encouraging.** The gate is the gate. A client who
   feels "ready" but hasn't cleared G1–G4 is exactly the one who breaks when load
   is added. Adherence is the master variable; the coach protects it above rapport.
2. **Never reveal the numbers to the client.** This instrument is the coach's
   internal gauge, not a rubric handed over. Disclosing thresholds re-creates the
   countdown and the clock-watching this design exists to kill. The client
   experiences graduation as earned recognition, never as a score they hit.
