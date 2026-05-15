export interface JediCompletion {
  name: string;
  complete: string;
  type: string;
  description: string;
}

type CompletionResponse = {
  kind: "complete";
  id: number;
  completions: JediCompletion[];
  error?: string;
};

type ReadyResponse = { kind: "ready"; ok: boolean; error?: string };

type Response = CompletionResponse | ReadyResponse;

let worker: Worker | undefined;
let nextId = 1;
const pending = new Map<number, (completions: JediCompletion[]) => void>();
let readyPromise: Promise<boolean> | undefined;
let isReady = false;

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./intellisense.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<Response>) => {
    const message = event.data;
    if (message.kind === "complete") {
      const resolver = pending.get(message.id);
      if (resolver) {
        pending.delete(message.id);
        resolver(message.completions);
      }
    }
  };
  worker.onerror = () => {
    for (const resolver of pending.values()) resolver([]);
    pending.clear();
  };
  return worker;
}

export function warmupIntellisense(): Promise<boolean> {
  if (readyPromise) return readyPromise;
  const w = ensureWorker();
  readyPromise = new Promise<boolean>((resolve) => {
    const listener = (event: MessageEvent<Response>) => {
      if (event.data.kind !== "ready") return;
      w.removeEventListener("message", listener);
      isReady = event.data.ok;
      resolve(event.data.ok);
    };
    w.addEventListener("message", listener);
    w.postMessage({ kind: "warmup" });
  });
  return readyPromise;
}

export function requestCompletions(code: string, line: number, column: number): Promise<JediCompletion[]> {
  const w = ensureWorker();
  const id = nextId++;
  return new Promise<JediCompletion[]>((resolve) => {
    pending.set(id, resolve);
    w.postMessage({ kind: "complete", id, code, line, column });
  });
}

export function intellisenseReady(): boolean {
  return isReady;
}
