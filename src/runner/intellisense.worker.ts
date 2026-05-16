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
  signature: string;
  doc: string;
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

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full";

function ensureJedi(): Promise<void> {
  jediReadyPromise ??= (async () => {
    const py = await ensurePyodide();
    // The local pyodide directory only ships the stdlib; pull jedi + parso
    // wheels from the Pyodide CDN. Versions match Pyodide 0.26.4's lockfile.
    await py.loadPackage([
      `${PYODIDE_CDN}/parso-0.8.4-py2.py3-none-any.whl`,
      `${PYODIDE_CDN}/jedi-0.19.1-py2.py3-none-any.whl`
    ]);
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
    for c in completions[:60]:
        try:
            desc = c.description or ""
        except Exception:
            desc = ""
        sig = ""
        try:
            sigs = c.get_signatures()
            if sigs:
                sig = sigs[0].to_string()
        except Exception:
            sig = ""
        doc = ""
        try:
            full = c.docstring(raw=False, fast=True) or ""
            full = full.strip()
            if not sig:
                # Builtins often expose their signature only via the
                # first docstring line (e.g. "insert(index, object, /)").
                first = full.split("\n", 1)[0].strip()
                if first.startswith(c.name + "(") or first.startswith(c.name + " ("):
                    sig = first
            # Keep only the prose part of the docstring for the info panel.
            body = full
            nl = full.find("\n")
            if nl != -1 and (full[:nl].startswith(c.name) or full[:nl] == sig):
                body = full[nl + 1:].strip()
            doc = body[:280]
        except Exception:
            doc = ""
        out.append({
            "name": c.name,
            "complete": c.complete or "",
            "type": c.type or "",
            "description": desc[:160],
            "signature": sig[:200],
            "doc": doc
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
