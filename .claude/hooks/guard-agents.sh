#!/bin/bash
# guard-agents.sh — PreToolUse hook on the Agent tool.
#
# Restricts top-level agent spawns for this project: the specialists
# `nutritionist` and `resistance-training` may ONLY be spawned by the
# `physique-guru` agent. Any attempt to spawn them directly from the main
# session (or from any other agent) is blocked, with a message telling the
# caller to route through physique-guru instead.
#
# Discriminator: the PreToolUse payload carries `agent_type` (the calling
# agent's name) ONLY when the call originates inside a subagent. So a spawn
# from the main session has no `agent_type`, while physique-guru's own
# specialist spawns carry `agent_type == "physique-guru"`.
#
# Built-in agents (Explore, general-purpose, Plan, claude, etc.) are not
# affected. All non-matching calls pass through untouched.

input=$(cat)

subagent_type=$(printf '%s' "$input" | jq -r '.tool_input.subagent_type // empty')
caller=$(printf '%s' "$input" | jq -r '.agent_type // empty')

case "$subagent_type" in
  nutritionist|resistance-training)
    if [ "$caller" != "physique-guru" ]; then
      jq -n --arg reason "Blocked: '$subagent_type' cannot be spawned directly. Specialists are reached only through the physique-guru agent. Spawn physique-guru instead — it orchestrates nutritionist and resistance-training and returns one unified answer." \
        '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
      exit 0
    fi
    ;;
esac

exit 0
