import type { Interface as ReadlineInterface } from "node:readline/promises";
import type { OnUserDialog, UserDialogResult } from "@anthropic-ai/claude-agent-sdk";

/**
 * Best-guess dialog_kind for the built-in AskUserQuestion tool — not documented
 * in the SDK types, inferred from naming convention ("refusal_fallback_prompt",
 * etc). If wrong, the CLI just falls back to AskUserQuestion's default (no-dialog)
 * behavior instead of failing, so this degrades safely.
 */
const ASK_USER_QUESTION_DIALOG_KIND = "ask_user_question";

interface AskUserQuestionOption {
  label: string;
  description?: string;
}

interface AskUserQuestionQuestion {
  question: string;
  header: string;
  options: AskUserQuestionOption[];
  multiSelect?: boolean;
}

function isAskUserQuestionPayload(
  payload: Record<string, unknown>,
): payload is { questions: AskUserQuestionQuestion[] } {
  return Array.isArray(payload.questions);
}

/** Renders physique-guru's AskUserQuestion calls as prompts in the terminal. */
export function createOnUserDialog(rl: ReadlineInterface): OnUserDialog {
  return async (request) => {
    if (
      request.dialogKind !== ASK_USER_QUESTION_DIALOG_KIND ||
      !isAskUserQuestionPayload(request.payload)
    ) {
      return { behavior: "cancelled" };
    }

    const answers: Record<string, string> = {};

    for (const q of request.payload.questions) {
      console.log(`\n[${q.header}] ${q.question}`);
      q.options.forEach((opt, i) => {
        const desc = opt.description ? ` — ${opt.description}` : "";
        console.log(`  ${i + 1}. ${opt.label}${desc}`);
      });

      const prompt = q.multiSelect
        ? "Pick option number(s), comma-separated (or type your own answer): "
        : "Pick option number (or type your own answer): ";
      const raw = (await rl.question(prompt)).trim();

      const indices = raw
        .split(",")
        .map((s) => parseInt(s.trim(), 10) - 1)
        .filter((i) => Number.isInteger(i) && i >= 0 && i < q.options.length);

      answers[q.question] =
        indices.length > 0
          ? indices.map((i) => q.options[i].label).join(", ")
          : raw;
    }

    const result: UserDialogResult = {
      behavior: "completed",
      result: { questions: request.payload.questions, answers },
    };
    return result;
  };
}

export { ASK_USER_QUESTION_DIALOG_KIND };
