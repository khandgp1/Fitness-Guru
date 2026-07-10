import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { createOnUserDialog, ASK_USER_QUESTION_DIALOG_KIND } from "./ask-user-dialog.js";
import { loadPhysiqueGuruTeam } from "./agents.js";

const CLI_ROOT = new URL("..", import.meta.url).pathname;
const REPO_ROOT = new URL("../..", import.meta.url).pathname;
const TEAM = loadPhysiqueGuruTeam(REPO_ROOT);

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  const onUserDialog = createOnUserDialog(rl);

  console.log("Fitness Guru — ask a question (Ctrl+C to quit).\n");

  try {
    while (true) {
      let question: string;
      try {
        question = (await rl.question("You: ")).trim();
      } catch {
        break; // stdin closed (e.g. Ctrl+D)
      }
      if (!question) continue;

      // physique-guru dispatches its specialists as background subagents and
      // checks in periodically, so a single question can yield several
      // interim 'result' turns ("still waiting on nutrition...") before the
      // real synthesized answer. Only the last one matters to the operator.
      process.stdout.write("Guru is thinking...\r");
      let lastResult: string | null = null;
      let lastError: string | null = null;

      try {
        for await (const message of query({
          prompt: question,
          options: {
            cwd: REPO_ROOT,
            systemPrompt: TEAM.systemPrompt,
            tools: TEAM.mainThreadTools,
            agents: TEAM.specialistAgents,
            settingSources: [],
            allowedTools: TEAM.allTools,
            permissionMode: "dontAsk",
            onUserDialog,
            supportedDialogKinds: [ASK_USER_QUESTION_DIALOG_KIND],
          },
        })) {
          if (message.type === "result") {
            if (message.subtype === "success") {
              lastResult = message.result;
              lastError = null;
            } else {
              lastError = `${message.subtype}: ${message.errors.join("; ")}`;
            }
          }
        }
      } catch (err) {
        // A turn-level failure (rate limit, network blip, model overload)
        // shouldn't take down the whole chat loop — just this turn.
        lastError = err instanceof Error ? err.message : String(err);
      }

      if (lastError) {
        console.error(`\n[error] ${lastError}\n`);
      } else if (lastResult) {
        console.log(`\nGuru: ${lastResult}\n`);
      } else {
        console.error("\n[no response received]\n");
      }
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
