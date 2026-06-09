import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  closeCompletion,
  moveCompletionSelection,
  nextSnippetField,
  prevSnippetField,
  snippet,
  startCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { go } from "@codemirror/lang-go";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  indentOnInput,
  StreamLanguage,
  syntaxHighlighting
} from "@codemirror/language";
import { type Diagnostic as CodeMirrorDiagnostic, linter } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState, Prec, RangeSetBuilder, type Extension } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  hoverTooltip,
  keymap,
  lineNumbers,
  tooltips,
  type Rect,
  ViewPlugin,
  type ViewUpdate
} from "@codemirror/view";
import { scala } from "@codemirror/legacy-modes/mode/clike";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FunctionSignature, LanguageId, ProblemLanguageSupport } from "../../../src/core/types";
import type {
  LspCompletionItem,
  LspDiagnostic,
  LspDocumentSymbol,
  LspSignatureHelp
} from "../../../src/lsp/types";
import { getCompletions, type CompletionItem } from "./completions";
import {
  formatWithLsp,
  getLspCompletions,
  getLspDefinition,
  getLspDiagnostics,
  getLspHover,
  getLspSignatureHelp,
  getLspSymbols
} from "./lspClient";

interface CodeEditorProps {
  value: string;
  language: LanguageId;
  problemId: string;
  partId?: string;
  signature?: FunctionSignature;
  support?: ProblemLanguageSupport;
  onChange: (value: string) => void;
  onRun?: (includeHidden: boolean) => void;
}

interface BasicCodeEditorProps {
  value: string;
  language: LanguageId;
  ariaLabel: string;
  onChange: (value: string) => void;
}

export function BasicCodeEditor({ value, language, ariaLabel, onChange }: BasicCodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const languageSlot = useMemo(() => new Compartment(), []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          ...basicEditorExtensions,
          languageSlot.of(languageExtension(language)),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          })
        ]
      })
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value }
    });
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: languageSlot.reconfigure(languageExtension(language))
    });
  }, [language, languageSlot]);

  return <div ref={hostRef} />;
}

export function CodeEditor({ value, language, problemId, partId, signature, support, onChange, onRun }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const signatureTimerRef = useRef<number | undefined>(undefined);
  const languageSlot = useMemo(() => new Compartment(), []);
  const ideSlot = useMemo(() => new Compartment(), []);
  const [diagnostics, setDiagnostics] = useState<LspDiagnostic[]>([]);
  const [symbols, setSymbols] = useState<LspDocumentSymbol[]>([]);
  const [panel, setPanel] = useState<"problems" | "symbols" | null>(null);
  const [signatureHelp, setSignatureHelp] = useState<LspSignatureHelp | undefined>();
  const [cursorLabel, setCursorLabel] = useState("Ln 1, Col 1");
  const [lspStatus, setLspStatus] = useState("LSP ready");
  const [busyAction, setBusyAction] = useState<"format" | "symbols" | "definition" | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          ...editorBaseExtensions,
          Prec.highest(keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                if (!onRunRef.current) return false;
                onRunRef.current(false);
                return true;
              }
            },
            {
              key: "Shift-Mod-Enter",
              run: () => {
                if (!onRunRef.current) return false;
                onRunRef.current(true);
                return true;
              }
            }
          ])),
          languageSlot.of(languageExtension(language)),
          ideSlot.of(ideExtensions({
            language,
            problemId,
            partId,
            signature,
            support,
            setDiagnostics,
            setSignatureHelp,
            setCursorLabel,
            setLspStatus,
            scheduleSignature: (editor) => scheduleSignatureHelp(editor)
          })),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          })
        ]
      })
    });
    viewRef.current = view;
    return () => {
      if (signatureTimerRef.current !== undefined) window.clearTimeout(signatureTimerRef.current);
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value }
    });
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: [
        languageSlot.reconfigure(languageExtension(language)),
        ideSlot.reconfigure(ideExtensions({
          language,
          problemId,
          partId,
          signature,
          support,
          setDiagnostics,
          setSignatureHelp,
          setCursorLabel,
          setLspStatus,
          scheduleSignature: (editor) => scheduleSignatureHelp(editor)
        }))
      ]
    });
    setDiagnostics([]);
    setSymbols([]);
    setSignatureHelp(undefined);
  }, [ideSlot, language, languageSlot, partId, problemId, signature, support]);

  const scheduleSignatureHelp = useCallback((view: EditorView) => {
    if (signatureTimerRef.current !== undefined) window.clearTimeout(signatureTimerRef.current);
    signatureTimerRef.current = window.setTimeout(() => {
      const code = view.state.doc.toString();
      const cursor = view.state.selection.main.head;
      void getLspSignatureHelp({ language, problemId, partId, code, cursor, timeoutMs: 1600 }, 1900).then((response) => {
        setSignatureHelp(response?.status === "ok" ? response.help : undefined);
      });
    }, 220);
  }, [language, partId, problemId]);

  const jumpToRange = useCallback((from: number, to = from) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      selection: { anchor: from, head: to },
      scrollIntoView: true
    });
    view.focus();
  }, []);

  const refreshSymbols = useCallback(async () => {
    const view = viewRef.current;
    if (!view) return;
    setBusyAction("symbols");
    const response = await getLspSymbols({
      language,
      problemId,
      partId,
      code: view.state.doc.toString(),
      timeoutMs: 3000
    }, 3400);
    setBusyAction(null);
    if (response?.status === "ok") {
      setSymbols(response.symbols);
      setLspStatus(response.symbols.length ? "Symbols updated" : "No document symbols");
    } else {
      setSymbols([]);
      setLspStatus(response?.message ?? "Symbols unavailable");
    }
  }, [language, partId, problemId]);

  const togglePanel = useCallback((nextPanel: "problems" | "symbols") => {
    setPanel((current) => {
      const open = current === nextPanel ? null : nextPanel;
      if (open === "symbols") void refreshSymbols();
      return open;
    });
  }, [refreshSymbols]);

  const formatDocument = useCallback(async () => {
    const view = viewRef.current;
    if (!view) return;
    setBusyAction("format");
    const response = await formatWithLsp({
      language,
      problemId,
      partId,
      code: view.state.doc.toString(),
      timeoutMs: 8000
    }, 8500);
    setBusyAction(null);
    if (!response || response.status !== "ok") {
      setLspStatus(response?.message ?? "Formatter unavailable");
      return;
    }
    if (response.code !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: response.code },
        scrollIntoView: true
      });
    }
    setLspStatus(response.edits.length ? "Formatted document" : "Already formatted");
    if (panel === "symbols") void refreshSymbols();
  }, [language, panel, partId, problemId, refreshSymbols]);

  const goToDefinition = useCallback(async () => {
    const view = viewRef.current;
    if (!view) return;
    setBusyAction("definition");
    const response = await getLspDefinition({
      language,
      problemId,
      partId,
      code: view.state.doc.toString(),
      cursor: view.state.selection.main.head,
      timeoutMs: 2500
    }, 2800);
    setBusyAction(null);
    const target = response?.definitions.find((definition) => definition.sameDocument && definition.selectionStart !== undefined);
    if (response?.status === "ok" && target?.selectionStart !== undefined) {
      jumpToRange(target.selectionStart, target.selectionEnd ?? target.selectionStart);
      setLspStatus("Jumped to definition");
    } else {
      setLspStatus(response?.definitions.length ? "Definition is outside this buffer" : response?.message ?? "No definition found");
    }
  }, [jumpToRange, language, partId, problemId]);

  return (
    <div className="ide-surface">
      <div className="ide-toolbar" aria-label="Editor tools">
        <div className="ide-status" title={lspStatus}>
          <span className={`ide-status-dot ${diagnostics.some((item) => item.severity === "error") ? "error" : diagnostics.length ? "warning" : "ok"}`} />
          {lspStatus}
        </div>
        <button type="button" onClick={() => void formatDocument()} disabled={busyAction === "format"} title="Format document">
          {busyAction === "format" ? "Formatting" : "Format"}
        </button>
        <button type="button" onClick={() => togglePanel("problems")} className={panel === "problems" ? "active" : ""}>
          Problems {diagnostics.length}
        </button>
        <button type="button" onClick={() => togglePanel("symbols")} className={panel === "symbols" ? "active" : ""} disabled={busyAction === "symbols"}>
          {busyAction === "symbols" ? "Symbols..." : `Symbols ${symbolCount(symbols) || ""}`}
        </button>
        <button type="button" onClick={() => void goToDefinition()} disabled={busyAction === "definition"} title="Go to definition">
          Definition
        </button>
      </div>
      <div className={`ide-workbench ${panel ? "with-panel" : ""}`}>
        <div className="code-editor" ref={hostRef} />
        {panel ? (
          <aside className="ide-panel" aria-label={panel === "problems" ? "Problems" : "Document symbols"}>
            {panel === "problems" ? (
              <ProblemsPanel diagnostics={diagnostics} onJump={jumpToRange} />
            ) : (
              <SymbolsPanel symbols={symbols} onJump={jumpToRange} />
            )}
          </aside>
        ) : null}
      </div>
      {signatureHelp ? <SignatureHelp help={signatureHelp} /> : null}
      <div className="ide-footer">
        <span>{cursorLabel}</span>
        <span>{languageLabel(language)} LSP</span>
      </div>
    </div>
  );
}

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#fffdf8",
    color: "#1d2528"
  },
  ".cm-scroller": {
    fontFamily: "\"SFMono-Regular\", Consolas, monospace",
    fontSize: "0.92rem",
    lineHeight: "1.55"
  },
  ".cm-content": {
    padding: "14px 0",
    caretColor: "#096b72"
  },
  ".cm-line": {
    padding: "0 14px"
  },
  ".cm-indent-guide": {
    backgroundImage: "linear-gradient(to bottom, rgba(9, 107, 114, 0.18) 45%, transparent 45%)",
    backgroundPosition: "left 0.25em top",
    backgroundRepeat: "repeat-y",
    backgroundSize: "1px 7px"
  },
  ".cm-indent-guide-active": {
    backgroundImage: "linear-gradient(to bottom, rgba(9, 107, 114, 0.34) 55%, transparent 55%)"
  },
  ".cm-gutters": {
    backgroundColor: "#f3efe4",
    color: "#617174",
    borderRight: "1px solid #ddd7ca"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#eef3f1",
    color: "#1d2528"
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(9, 107, 114, 0.08)"
  },
  "&.cm-focused": {
    outline: "none"
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(9, 107, 114, 0.22)"
  },
  ".cm-tooltip": {
    border: "1px solid #ddd7ca",
    backgroundColor: "#fffdf8",
    color: "#1d2528",
    borderRadius: "6px",
    maxWidth: "min(520px, calc(100vw - 32px))",
    overflow: "hidden",
    boxShadow: "0 18px 40px rgba(36, 38, 35, 0.16)"
  },
  ".cm-tooltip-lint": {
    maxWidth: "min(520px, calc(100vw - 32px))"
  },
  ".cm-tooltip-autocomplete ul": {
    fontFamily: "\"SFMono-Regular\", Consolas, monospace",
    maxHeight: "260px"
  },
  ".cm-tooltip-autocomplete ul li": {
    padding: "6px 10px"
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "#096b72",
    color: "#ffffff"
  },
  ".cm-completionDetail": {
    color: "#617174"
  },
  ".cm-completionMatchedText": {
    color: "#096b72",
    textDecoration: "none"
  }
});

const INDENT_GUIDE_COLUMNS = 2;

const indentGuideDecoration = Decoration.mark({ class: "cm-indent-guide" });
const activeIndentGuideDecoration = Decoration.mark({ class: "cm-indent-guide cm-indent-guide-active" });

const indentGuidePlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = buildIndentGuides(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged || update.selectionSet) {
      this.decorations = buildIndentGuides(update.view);
    }
  }
}, {
  decorations: (plugin) => plugin.decorations
});

function buildIndentGuides(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const activeLine = view.state.doc.lineAt(view.state.selection.main.head).number;

  for (const range of view.visibleRanges) {
    let position = range.from;
    while (position <= range.to) {
      const line = view.state.doc.lineAt(position);
      addIndentGuidesForLine(builder, line.from, line.text, line.number === activeLine);
      position = line.to + 1;
    }
  }

  return builder.finish();
}

function addIndentGuidesForLine(
  builder: RangeSetBuilder<Decoration>,
  lineStart: number,
  lineText: string,
  isActiveLine: boolean
) {
  const indentLength = leadingWhitespaceLength(lineText);
  if (indentLength < INDENT_GUIDE_COLUMNS) return;

  for (let column = 0; column + INDENT_GUIDE_COLUMNS <= indentLength; column += INDENT_GUIDE_COLUMNS) {
    const decoration = isActiveLine && column + INDENT_GUIDE_COLUMNS === indentLength
      ? activeIndentGuideDecoration
      : indentGuideDecoration;
    builder.add(lineStart + column, lineStart + column + 1, decoration);
  }
}

function leadingWhitespaceLength(text: string): number {
  const match = text.match(/^[\t ]+/);
  return match ? match[0].length : 0;
}

const editorBaseExtensions: Extension[] = [
  lineNumbers(),
  foldGutter(),
  history(),
  drawSelection(),
  dropCursor(),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  highlightSelectionMatches(),
  tooltips({ tooltipSpace: editorTooltipSpace }),
  indentGuidePlugin,
  keymap.of([
    { key: "Ctrl-Space", run: startCompletion },
    { key: "Escape", run: closeCompletion },
    { key: "ArrowDown", run: moveCompletionSelection(true) },
    { key: "ArrowUp", run: moveCompletionSelection(false) },
    { key: "PageDown", run: moveCompletionSelection(true, "page") },
    { key: "PageUp", run: moveCompletionSelection(false, "page") },
    { key: "Tab", run: acceptCompletion },
    { key: "Tab", run: nextSnippetField },
    { key: "Shift-Tab", run: prevSnippetField },
    indentWithTab,
    ...searchKeymap,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap
  ]),
  editorTheme
];

const basicEditorExtensions: Extension[] = [
  lineNumbers(),
  history(),
  drawSelection(),
  dropCursor(),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  indentGuidePlugin,
  keymap.of([
    indentWithTab,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap
  ]),
  editorTheme
];

function editorTooltipSpace(view: EditorView): Rect {
  const rect = view.scrollDOM.getBoundingClientRect();
  const inset = 8;
  return {
    top: rect.top + inset,
    left: rect.left + inset,
    right: rect.right - inset,
    bottom: rect.bottom - inset
  };
}

interface IdeExtensionOptions {
  language: LanguageId;
  problemId: string;
  partId?: string;
  signature?: FunctionSignature;
  support?: ProblemLanguageSupport;
  setDiagnostics: (diagnostics: LspDiagnostic[]) => void;
  setSignatureHelp: (help: LspSignatureHelp | undefined) => void;
  setCursorLabel: (label: string) => void;
  setLspStatus: (status: string) => void;
  scheduleSignature: (view: EditorView) => void;
}

function ideExtensions(options: IdeExtensionOptions): Extension[] {
  return [
    autocompletion({
      activateOnTyping: true,
      activateOnTypingDelay: 250,
      defaultKeymap: false,
      maxRenderedOptions: 12,
      override: [lspBackedCompletionSource(options.language, options.problemId, options.partId, options.signature, options.support)]
    }),
    linter(async (view) => {
      const response = await getLspDiagnostics({
        language: options.language,
        problemId: options.problemId,
        partId: options.partId,
        code: view.state.doc.toString(),
        timeoutMs: 1100
      }, 1400);
      const diagnostics = response?.status === "ok" ? response.diagnostics : [];
      options.setDiagnostics(diagnostics);
      if (response?.status === "ok") {
        options.setLspStatus(diagnostics.length ? `${diagnostics.length} problem${diagnostics.length === 1 ? "" : "s"}` : "No problems");
      } else if (response?.message) {
        options.setLspStatus(response.message);
      }
      return diagnostics.map((diagnostic) => toCodeMirrorDiagnostic(diagnostic));
    }, {
      delay: 650,
      needsRefresh: (update) => update.docChanged
    }),
    hoverTooltip(async (view, pos) => {
      const response = await getLspHover({
        language: options.language,
        problemId: options.problemId,
        partId: options.partId,
        code: view.state.doc.toString(),
        cursor: pos,
        timeoutMs: 1600
      }, 1900);
      if (response?.status !== "ok" || !response.hover?.contents) return null;
      return {
        pos: response.hover.rangeStart ?? pos,
        end: response.hover.rangeEnd,
        above: true,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "ide-hover";
          dom.textContent = response.hover?.contents ?? "";
          return { dom };
        }
      };
    }, { hoverTime: 250 }),
    EditorView.updateListener.of((update) => {
      const head = update.state.selection.main.head;
      const line = update.state.doc.lineAt(head);
      options.setCursorLabel(`Ln ${line.number}, Col ${head - line.from + 1}`);
      if (update.selectionSet || update.docChanged) {
        options.scheduleSignature(update.view);
        if (!isSignaturePosition(update.state.sliceDoc(Math.max(0, head - 1), head))) {
          options.setSignatureHelp(undefined);
        }
      }
    })
  ];
}

function lspBackedCompletionSource(
  language: LanguageId,
  problemId: string,
  partId?: string,
  signature?: FunctionSignature,
  support?: ProblemLanguageSupport
): CompletionSource {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    const code = context.state.doc.toString();
    const offline = offlineCompletionResult(language, code, context.pos, context.explicit, signature, support);
    if (!problemId || !shouldQueryLsp(context)) return offline;

    const timeoutMs = context.explicit ? 2500 : 1000;
    const response = await getLspCompletions({
      language,
      problemId,
      partId,
      code,
      cursor: context.pos,
      timeoutMs
    }, timeoutMs + 250);

    if (!response || response.status !== "ok" || response.items.length === 0) return offline;
    const lspOptions = response.items.map((item) => toCodeMirrorLspCompletion(item));
    const offlineOptions = offline?.options ?? [];
    return {
      from: completionRangeStart(response.items, offline?.from ?? context.pos),
      to: completionRangeEnd(response.items, offline?.to ?? context.pos),
      options: dedupeCompletions([...lspOptions, ...offlineOptions]),
      validFor: /^[A-Za-z0-9_$]*$/
    };
  };
}

function ProblemsPanel({ diagnostics, onJump }: { diagnostics: LspDiagnostic[]; onJump: (from: number, to?: number) => void }) {
  if (!diagnostics.length) {
    return <div className="ide-empty">No diagnostics.</div>;
  }
  return (
    <div className="ide-list">
      {diagnostics.map((diagnostic, index) => (
        <button
          type="button"
          key={`${diagnostic.rangeStart}:${diagnostic.rangeEnd}:${index}`}
          className={`ide-list-item severity-${diagnostic.severity}`}
          onClick={() => onJump(diagnostic.rangeStart, diagnostic.rangeEnd)}
        >
          <strong>{diagnostic.severity}</strong>
          <span>{diagnostic.message}</span>
          {diagnostic.source ? <small>{diagnostic.source}</small> : null}
        </button>
      ))}
    </div>
  );
}

function SymbolsPanel({ symbols, onJump }: { symbols: LspDocumentSymbol[]; onJump: (from: number, to?: number) => void }) {
  if (!symbols.length) {
    return <div className="ide-empty">No document symbols.</div>;
  }
  return <div className="ide-list symbol-list">{symbols.map((symbol) => <SymbolButton key={`${symbol.name}:${symbol.selectionStart}`} symbol={symbol} depth={0} onJump={onJump} />)}</div>;
}

function SymbolButton({
  symbol,
  depth,
  onJump
}: {
  symbol: LspDocumentSymbol;
  depth: number;
  onJump: (from: number, to?: number) => void;
}) {
  return (
    <>
      <button
        type="button"
        className="ide-list-item symbol-item"
        style={{ paddingLeft: `${10 + depth * 14}px` }}
        onClick={() => onJump(symbol.selectionStart, symbol.selectionEnd)}
      >
        <strong>{symbol.kind ?? "symbol"}</strong>
        <span>{symbol.name}</span>
        {symbol.detail ? <small>{symbol.detail}</small> : null}
      </button>
      {symbol.children?.map((child) => (
        <SymbolButton key={`${child.name}:${child.selectionStart}`} symbol={child} depth={depth + 1} onJump={onJump} />
      ))}
    </>
  );
}

function SignatureHelp({ help }: { help: LspSignatureHelp }) {
  const active = help.signatures[help.activeSignature] ?? help.signatures[0];
  if (!active) return null;
  return (
    <div className="ide-signature">
      <strong>{active.label}</strong>
      {active.parameters[help.activeParameter]?.label ? <span>{active.parameters[help.activeParameter].label}</span> : null}
      {active.documentation ? <p>{active.documentation}</p> : null}
    </div>
  );
}

function toCodeMirrorDiagnostic(diagnostic: LspDiagnostic): CodeMirrorDiagnostic {
  return {
    from: diagnostic.rangeStart,
    to: Math.max(diagnostic.rangeEnd, diagnostic.rangeStart + 1),
    severity: diagnostic.severity === "error" || diagnostic.severity === "warning" ? diagnostic.severity : "info",
    message: diagnostic.message,
    source: diagnostic.source
  };
}

function symbolCount(symbols: LspDocumentSymbol[]): number {
  return symbols.reduce((count, symbol) => count + 1 + symbolCount(symbol.children ?? []), 0);
}

function offlineCompletionResult(
  language: LanguageId,
  code: string,
  cursor: number,
  explicit: boolean,
  signature?: FunctionSignature,
  support?: ProblemLanguageSupport
): CompletionResult | null {
  const result = getCompletions({ language, code, cursor, signature, support, explicit });
  if (!result) return null;
  return {
    from: result.rangeStart,
    to: result.rangeEnd,
    options: result.items.map((item) => toCodeMirrorCompletion(item)),
    validFor: /^[A-Za-z0-9_$]*$/
  };
}

function languageLabel(language: LanguageId): string {
  if (language === "typescript") return "TypeScript";
  if (language === "python") return "Python";
  if (language === "go") return "Go";
  if (language === "scala") return "Scala";
  return language;
}

function isSignaturePosition(value: string): boolean {
  return value === "(" || value === "," || value === " ";
}

function toCodeMirrorCompletion(item: CompletionItem): Completion {
  return {
    label: item.label,
    detail: item.detail,
    type: completionType(item.kind),
    apply: (view, _completion, from, to) => {
      const cursorOffset = item.cursorOffset ?? item.insertText.length;
      view.dispatch({
        changes: { from, to, insert: item.insertText },
        selection: { anchor: from + cursorOffset },
        scrollIntoView: true
      });
    }
  };
}

function toCodeMirrorLspCompletion(item: LspCompletionItem): Completion {
  return {
    label: item.label,
    detail: item.detail,
    info: item.documentation,
    type: completionType(item.kind),
    boost: item.sortText ? -Number(item.sortText.replace(/\D/g, "").slice(0, 4) || 0) : undefined,
    apply: (view) => {
      if (item.isSnippet) {
        snippet(item.insertText)(view, null, item.rangeStart, item.rangeEnd);
        return;
      }
      view.dispatch({
        changes: { from: item.rangeStart, to: item.rangeEnd, insert: item.insertText },
        selection: { anchor: item.rangeStart + item.insertText.length },
        scrollIntoView: true
      });
    }
  };
}

function completionType(kind: CompletionItem["kind"] | LspCompletionItem["kind"]): Completion["type"] {
  if (kind === "keyword") return "keyword";
  if (kind === "snippet") return "function";
  if (kind === "builtin") return "constant";
  if (kind === "function" || kind === "method" || kind === "constructor") return "function";
  if (kind === "class" || kind === "interface" || kind === "struct" || kind === "typeParameter") return "class";
  if (kind === "property" || kind === "field") return "property";
  if (kind === "constant" || kind === "enumMember") return "constant";
  if (kind === "module") return "namespace";
  return "variable";
}

function shouldQueryLsp(context: CompletionContext): boolean {
  if (context.explicit) return true;
  const token = context.matchBefore(/[A-Za-z0-9_$]*$/);
  if (token && token.from < token.to) return true;
  const previous = context.state.sliceDoc(Math.max(0, context.pos - 1), context.pos);
  return previous === "." || previous === ":" || previous === ">";
}

function completionRangeStart(items: LspCompletionItem[], fallback: number): number {
  return Math.min(fallback, ...items.map((item) => item.rangeStart));
}

function completionRangeEnd(items: LspCompletionItem[], fallback: number): number {
  return Math.max(fallback, ...items.map((item) => item.rangeEnd));
}

function dedupeCompletions(items: Completion[]): Completion[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.label}:${item.detail ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function languageExtension(language: LanguageId): Extension {
  if (language === "typescript") return javascript({ typescript: true });
  if (language === "python") return python();
  if (language === "go") return go();
  if (language === "scala") return StreamLanguage.define(scala);
  return [];
}
