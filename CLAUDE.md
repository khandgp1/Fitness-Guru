# Fitness-Guru — project instructions

## Agent spawning: physique-guru is the only entry point

This project's physique work runs through a strict agent hierarchy:

```
session ──▶ physique-guru ──▶ nutritionist
                          └──▶ resistance-training
```

**Never spawn `nutritionist` or `resistance-training` directly.** For any
physique, nutrition, or training work, spawn **`physique-guru`** — it
orchestrates both specialists and returns one unified answer in its own voice.

This is enforced by a PreToolUse hook (`.claude/hooks/guard-agents.sh`): a direct
spawn of either specialist from the main session (or any agent other than
physique-guru) is **hard-blocked**. Don't work around it — route through
physique-guru. Built-in agents (Explore, general-purpose, Plan, etc.) are
unaffected.

Physique-guru's own spawns of its two specialists are allowed — that's the whole
point of the hierarchy, and the hook lets them through (it keys off the calling
agent).
