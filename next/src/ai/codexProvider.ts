import { Codex } from "@openai/codex-sdk";

export interface CodexTextResult {
  ok: true;
  text: string;
  usage: unknown;
}

export interface CodexErrorResult {
  ok: false;
  error: string;
}

export type CodexResult = CodexTextResult | CodexErrorResult;

export async function codexStatus(): Promise<{ available: boolean; provider: "codex-sdk"; model: string | null; reason?: string }> {
  try {
    const codex = createCodexClient();
    const thread = codex.startThread({
      approvalPolicy: "never",
      sandboxMode: "read-only",
      skipGitRepoCheck: true,
      model: process.env.DSA_COACH_CODEX_MODEL || undefined,
      modelReasoningEffort: "low"
    });
    await thread.run("Reply with exactly: ok");
    return {
      available: true,
      provider: "codex-sdk",
      model: process.env.DSA_COACH_CODEX_MODEL || "Codex default"
    };
  } catch (error) {
    return {
      available: false,
      provider: "codex-sdk",
      model: null,
      reason: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function runCodexText(args: {
  prompt: string;
  workingDirectory?: string;
  outputSchema?: unknown;
  effort?: "minimal" | "low" | "medium" | "high" | "xhigh";
  timeoutMs?: number;
}): Promise<CodexResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), args.timeoutMs ?? 120000);
  try {
    const codex = createCodexClient();
    const thread = codex.startThread({
      approvalPolicy: "never",
      sandboxMode: "read-only",
      skipGitRepoCheck: true,
      workingDirectory: args.workingDirectory,
      model: process.env.DSA_COACH_CODEX_MODEL || undefined,
      modelReasoningEffort: args.effort ?? "high",
      networkAccessEnabled: false,
      webSearchMode: "disabled"
    });
    const turn = await thread.run(args.prompt, {
      outputSchema: args.outputSchema,
      signal: controller.signal
    });
    return { ok: true, text: turn.finalResponse, usage: turn.usage };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

function createCodexClient(): Codex {
  return new Codex({
    env: {
      ...process.env,
      PATH: process.env.PATH ?? "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    }
  });
}
