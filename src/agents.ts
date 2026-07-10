import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

interface AgentFile {
  name: string;
  description: string;
  tools: string[];
  prompt: string;
}

function parseAgentFile(filePath: string): AgentFile {
  const raw = readFileSync(filePath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Malformed agent frontmatter: ${filePath}`);
  const [, frontmatter, body] = match;

  const fields: Record<string, string> = {};
  for (const line of frontmatter.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }

  return {
    name: fields.name,
    description: fields.description,
    tools: (fields.tools ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    prompt: body.trim(),
  };
}

export function loadPhysiqueGuruTeam(projectRoot: string) {
  const agentsDir = join(projectRoot, ".claude", "agents");

  const physiqueGuru = parseAgentFile(join(agentsDir, "physique-guru.md"));
  const nutritionist = parseAgentFile(join(agentsDir, "nutritionist.md"));
  const resistanceTraining = parseAgentFile(join(agentsDir, "resistance-training.md"));

  // Registered ONLY as invocable subagents (nutritionist, resistance-training) —
  // physique-guru itself is deliberately left out of this map and driven as the
  // main thread instead. Otherwise the Agent tool's subagent_type list includes
  // "physique-guru" as a valid choice and the model can (and did, in testing)
  // dispatch a nested copy of itself instead of its two real specialists,
  // stalling the conversation.
  const specialistAgents: Record<string, AgentDefinition> = {
    [nutritionist.name]: {
      description: nutritionist.description,
      tools: nutritionist.tools,
      prompt: nutritionist.prompt,
    },
    [resistanceTraining.name]: {
      description: resistanceTraining.description,
      tools: resistanceTraining.tools,
      prompt: resistanceTraining.prompt,
    },
  };

  const allTools = [
    ...new Set([
      ...physiqueGuru.tools,
      ...nutritionist.tools,
      ...resistanceTraining.tools,
    ]),
  ];

  return {
    systemPrompt: physiqueGuru.prompt,
    mainThreadTools: physiqueGuru.tools,
    allTools,
    specialistAgents,
  };
}
