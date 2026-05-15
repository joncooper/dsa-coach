import { loadPyodide } from "pyodide";

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

type CompletionRequest = {
  kind: "complete";
  id: number;
  code: string;
  line: number;
  column: number;
};

type WarmupRequest = { kind: "warmup" };

type Request = CompletionRequest | WarmupRequest;

type JediCompletion = {
  name: string;
  complete: string;
  type: string;
  description: string;
};

type CompletionResponse = {
  kind: "complete";
  id: number;
  completions: JediCompletion[];
  error?: string;
};

type ReadyResponse = { kind: "ready"; ok: boolean; error?: string };

let pyodidePromise: ReturnType<typeof loadPyodide> | undefined;
let jediReadyPromise: Promise<void> | undefined;

function ensurePyodide() {
  pyodidePromise ??= loadPyodide({ indexURL: "/pyodide/" });
  return pyodidePromise;
}

function ensureJedi(): Promise<void> {
  jediReadyPromise ??= (async () => {
    const py = await ensurePyodide();
    await py.loadPackage(["jedi"]);
    // Pre-import jedi so the first completion request doesn't pay the import cost.
    await py.runPythonAsync("import jedi");
  })();
  return jediReadyPromise;
}

const COMPLETION_HARNESS = String.raw`
import json
import jedi

def _run():
    script = jedi.Script(INTELLISENSE_CODE)
    out = []
    try:
        completions = script.complete(INTELLISENSE_LINE, INTELLISENSE_COL)
    except Exception:
        return json.dumps([])
    for c in completions:
        try:
            desc = c.description or ""
        except Exception:
            desc = ""
        out.append({
            "name": c.name,
            "complete": c.complete or "",
            "type": c.type or "",
            "description": desc[:160]
        })
    return json.dumps(out)

_run()
`;

async function handleCompletion(request: CompletionRequest): Promise<CompletionResponse> {
  try {
    await ensureJedi();
    const py = await ensurePyodide();
    py.globals.set("INTELLISENSE_CODE", request.code);
    py.globals.set("INTELLISENSE_LINE", request.line);
    py.globals.set("INTELLISENSE_COL", request.column);
    const raw = (await py.runPythonAsync(COMPLETION_HARNESS)) as string;
    const completions = JSON.parse(raw) as JediCompletion[];
    return { kind: "complete", id: request.id, completions };
  } catch (error) {
    return {
      kind: "complete",
      id: request.id,
      completions: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function handleWarmup(): Promise<ReadyResponse> {
  try {
    await ensureJedi();
    return { kind: "ready", ok: true };
  } catch (error) {
    return {
      kind: "ready",
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

workerScope.onmessage = async (event: MessageEvent<Request>) => {
  const message = event.data;
  if (message.kind === "warmup") {
    const response = await handleWarmup();
    workerScope.postMessage(response);
    return;
  }
  if (message.kind === "complete") {
    const response = await handleCompletion(message);
    workerScope.postMessage(response);
  }
};
