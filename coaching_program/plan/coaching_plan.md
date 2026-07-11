# Coaching Plan

Last updated: 2026-07-11_003

> Read top-down by altitude. **Layer 1** is what you do — open it daily.
> **Layer 2** is the instrument you read the client through. **Layer 3** is why
> any of this is shaped the way it is — open it rarely.

---

## LAYER 1 — OPERATING RULES

*Terse and imperative. This is the coach's actual job.*

### Onboarding — Day Zero

A client enters with **no intake**. No forms, no questionnaire, no numbers.
Front-loading complexity contradicts the whole method.

1. **First contact:** the client arrives. You send them one thing — the intro
   message (below). Nothing else is assigned.
2. **The program begins the next morning**, when they send their first GM. That
   first GM starts the clock (`first_gm_date`).
3. Until the gate clears, **GM is the entire program.** No training, no diet, no
   targets. Resist the urge to give more.

**The intro message (send verbatim — and it's true):**

> "Here's how we start. Every morning, you send me one thing: GM. That's it. No
> numbers, no length. You're not counting down to anything, because the people
> who get this body and keep it don't count down to anything. They just show up.
> This is me finding out if you're one of them before I build you something that
> assumes you are. Miss a day? You send GM the next day and we keep going. The
> streak isn't the point. Showing back up is."

### The daily loop

- Client sends **GM** every morning.
- **A bare GM → reply `🫡`.** One non-escalating token: *received, carry on*.
  Never praise, tally, or reference the streak.
- **A GM carrying anything more** than the bare greeting → **do not fire `🫡`.**
  A reflexive salute to a message that said something real reads as the coach
  not listening. This message falls outside the ritual and is not answered by
  the default reply.
- The period is **never disclosed** to the client. They are not counting down to
  anything.

### When a day is missed

- Pull them back gracefully: **"day missed, GM today, keep going."**
- The streak is not the point. Showing back up is.

### The advancement decision

- Advance the client — i.e. stack the first new behavior — **only when the
  graduation gate clears** (all four criteria, Layer 2). Any one failing = hold.
- **Stacking rule:** add **one** thing, and **keep the GM**. Don't replace the
  ritual — build on top of it. You're stacking.

### Two rules that never bend

1. **Never advance early to be encouraging.** The gate is the gate.
2. **Never reveal the numbers to the client.** The instrument is your gauge, not
   their rubric.

*(Why these two hold — Layer 3.)*

---

## LAYER 2 — THE INSTRUMENT

*The signals you read the client through. Internal to the coach — never shown to
the client.*

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

### The graduation gate (Phase 1 → Phase 2)

Advance **only when ALL four hold**. Any one failing = hold in Phase 1.
Thresholds are explicit **defaults, tunable** — change the numbers, not the logic.

| # | Criterion | Objective threshold |
|---|---|---|
| **G1 — Tenure** | Enough time to be a habit, not novelty | ≥ 14 days since `first_gm_date` |
| **G2 — Consistency** | Shows up nearly every day | ≤ 2 misses in trailing 14 days (≥85% adherence) |
| **G3 — Autonomy** | Runs without the coach | 0 prompted GMs in trailing 10 days |
| **G4 — Anchoring** | It's reflex, not a daily decision | All trailing-10 GMs within ±3h of the anchor |

---

## LAYER 3 — PRINCIPLES

*The why. Open rarely.*

### Philosophy

Consistency is the delivery mechanism. No process is possible without it.

**Hierarchy:**

1. **Adherence** — do it, repeatedly, for a long time
2. **Progression** — make it harder over time
3. **Optimization** — the exact split, macros, exercise selection

Coaching should be engineered for adherence, not for theoretical optimality.

### Why the timeline is undisclosed

The daily GM runs for a period the client is never told, because:

1. Timelines can be gamed
2. Timelines are audited
3. Timelines are inherently not forever — so it never becomes who you are
4. It filters clients, because a GM is something that literally is never too hard

### Why the two hard rules bind

1. **Never advance early to be encouraging.** A client who feels "ready" but
   hasn't cleared G1–G4 is exactly the one who breaks when load is added.
   Adherence is the master variable; the coach protects it above rapport.
2. **Never reveal the numbers.** Disclosing thresholds re-creates the countdown
   and clock-watching this design exists to kill. The client experiences
   graduation as earned recognition, never as a score they hit.
