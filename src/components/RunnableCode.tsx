import { useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { Play, RotateCcw, Square } from "lucide-react";
import { pythonEditorExtensions } from "./editor/pythonEditorExtensions";
import { runPythonScratchpad } from "../runner/pythonRunner";
import type { RunResult } from "../types";

/**
 * An editable, runnable Python snippet embedded in a lesson. Authored from a
 * ```python-run fenced block. Runs through the shared Pyodide scratchpad
 * harness, so `ListNode`, `deque`, `heapq`, etc. are already in scope.
 */
export function RunnableCode({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Wrap long lines so the editor never becomes a horizontally scrollable
  // region (keeps the snippet keyboard-accessible without a focusable scroller).
  const extensions = useMemo(
    () => [...pythonEditorExtensions({ ariaLabel: "Editable lesson code" }), EditorView.lineWrapping],
    []
  );

  const failed = result?.status === "error" || result?.status === "timeout";
  const stopped = result?.status === "stopped";
  const dirty = code !== initialCode;

  const run = async () => {
    if (abortRef.current) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setResult(null);
    try {
      setResult(await runPythonScratchpad(code, controller.signal));
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  return (
    <div className="runnable-code">
      <div className="runnable-code-editor">
        <CodeMirror
          value={code}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            autocompletion: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false
          }}
          onChange={setCode}
        />
      </div>
      <div className="runnable-code-bar">
        {running ? (
          <button type="button" className="runnable-run stop-button" onClick={stop}>
            <Square size={14} fill="currentColor" />
            Stop
          </button>
        ) : (
          <button type="button" className="runnable-run" onClick={() => void run()}>
            <Play size={14} />
            Run
          </button>
        )}
        {dirty ? (
          <button
            type="button"
            className="runnable-reset"
            onClick={() => {
              setCode(initialCode);
              setResult(null);
            }}
          >
            <RotateCcw size={13} />
            Reset
          </button>
        ) : null}
        <span className="runnable-hint">Editable — change the inputs and run.</span>
        {result && !running ? <span className="runnable-time">{result.durationMs} ms</span> : null}
      </div>
      {result && !running ? (
        <div className={`runnable-output${failed ? " is-error" : ""}`}>
          {result.stdout ? <pre className="runnable-stream">{result.stdout.replace(/\n+$/, "")}</pre> : null}
          {failed && result.message ? <pre className="runnable-stream is-error">{result.message.replace(/\n+$/, "")}</pre> : null}
          {stopped ? <p className="runnable-empty">Run stopped before it finished.</p> : null}
          {!failed && !stopped && !result.stdout ? (
            <p className="runnable-empty">
              Ran cleanly with no output. Add a <code>print(...)</code> line to see a value.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
