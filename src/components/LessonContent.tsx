import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Lightbulb, AlertTriangle, Key, Info } from "lucide-react";
import { RunnableCode } from "./RunnableCode";
import { CoachAssist } from "./CoachAssist";
import { LessonDiagram } from "./LessonDiagram";
import { LESSON_COACH_SYSTEM_PROMPT, buildQuizCoachPrompt } from "../coach/coachPrompts";

interface LessonContextValue {
  lessonTitle: string;
  /** Called once per inline checkpoint, on the learner's first attempt. */
  onCheckpoint: (correct: boolean) => void;
}

const LessonContext = createContext<LessonContextValue>({ lessonTitle: "", onCheckpoint: () => {} });

export function LessonContent({
  content,
  lessonTitle,
  onCheckpoint
}: {
  content: string;
  lessonTitle: string;
  onCheckpoint?: (correct: boolean) => void;
}) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  const value = useMemo<LessonContextValue>(
    () => ({ lessonTitle, onCheckpoint: onCheckpoint ?? (() => {}) }),
    [lessonTitle, onCheckpoint]
  );
  return (
    <LessonContext.Provider value={value}>
      <div className="lesson-content">{blocks.map((block, index) => renderBlock(block, index))}</div>
    </LessonContext.Provider>
  );
}

// ---------- Block model ----------

type BlockNode =
  | { kind: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "code"; lang: string; lines: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "rule" }
  | { kind: "quiz"; question: string; choices: { text: string; correct: boolean }[]; explanation: string }
  | { kind: "fill"; segments: FillSegment[]; explanation: string }
  | { kind: "callout"; tone: "tip" | "warning" | "key" | "note"; title?: string; body: BlockNode[] }
  | { kind: "steps"; intro: BlockNode[]; header: string[]; rows: string[][] }
  | { kind: "diagram"; diagramType: string; params: Record<string, string> };

type FillSegment = { kind: "text"; text: string } | { kind: "blank"; answer: string };

// ---------- Parser ----------

function parseBlocks(source: string): BlockNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  return parseRange(lines, 0, lines.length).nodes;
}

interface ParseResult { nodes: BlockNode[]; end: number }

function parseRange(lines: string[], start: number, stop: number): ParseResult {
  const nodes: BlockNode[] = [];
  let i = start;

  const flushParagraph = (buffer: string[]) => {
    if (!buffer.length) return;
    nodes.push({ kind: "paragraph", text: buffer.join(" ") });
    buffer.length = 0;
  };

  const paragraphBuf: string[] = [];

  while (i < stop) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip blank lines (also flush any in-progress paragraph).
    if (!trimmed) {
      flushParagraph(paragraphBuf);
      i += 1;
      continue;
    }

    // Custom block start: ":::kind ..."
    if (trimmed.startsWith(":::")) {
      flushParagraph(paragraphBuf);
      const header = trimmed.slice(3).trim();
      const { node, next } = parseCustomBlock(lines, i + 1, stop, header);
      nodes.push(node);
      i = next;
      continue;
    }

    // Horizontal rule.
    if (/^-{3,}$/.test(trimmed)) {
      flushParagraph(paragraphBuf);
      nodes.push({ kind: "rule" });
      i += 1;
      continue;
    }

    // Headings.
    if (/^#{1,4} /.test(trimmed)) {
      flushParagraph(paragraphBuf);
      const hash = trimmed.match(/^(#{1,4}) /)![1];
      const level = hash.length as 1 | 2 | 3 | 4;
      nodes.push({ kind: "heading", level, text: trimmed.slice(hash.length + 1).trim() });
      i += 1;
      continue;
    }

    // Fenced code blocks.
    if (trimmed.startsWith("```")) {
      flushParagraph(paragraphBuf);
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < stop && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < stop) i += 1; // consume closing fence
      nodes.push({ kind: "code", lang, lines: codeLines });
      continue;
    }

    // Tables: a line of "| ... |" followed by a separator "|---|---|".
    if (trimmed.startsWith("|") && i + 1 < stop && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
      flushParagraph(paragraphBuf);
      const header = splitTableRow(trimmed);
      i += 2; // header + separator
      const rows: string[][] = [];
      while (i < stop && lines[i].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[i].trim()));
        i += 1;
      }
      nodes.push({ kind: "table", header, rows });
      continue;
    }

    // Unordered list (greedy run).
    if (/^- /.test(trimmed)) {
      flushParagraph(paragraphBuf);
      const items: string[] = [];
      while (i < stop) {
        const t = lines[i].trim();
        if (!t.startsWith("- ")) break;
        items.push(t.slice(2));
        i += 1;
      }
      nodes.push({ kind: "ul", items });
      continue;
    }

    // Ordered list.
    if (/^\d+\. /.test(trimmed)) {
      flushParagraph(paragraphBuf);
      const items: string[] = [];
      while (i < stop) {
        const t = lines[i].trim();
        const m = t.match(/^\d+\. (.*)$/);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      nodes.push({ kind: "ol", items });
      continue;
    }

    // Default: collect into a paragraph buffer (joining wrapped lines with a space).
    paragraphBuf.push(trimmed);
    i += 1;
  }

  flushParagraph(paragraphBuf);
  return { nodes, end: i };
}

function splitTableRow(line: string): string[] {
  const inside = line.replace(/^\|/, "").replace(/\|$/, "");
  return inside.split("|").map((cell) => cell.trim());
}

interface CustomBlockResult { node: BlockNode; next: number }

function parseCustomBlock(lines: string[], start: number, stop: number, header: string): CustomBlockResult {
  const inner: string[] = [];
  let i = start;
  while (i < stop) {
    const t = lines[i].trim();
    if (t.startsWith(":::")) {
      i += 1; // consume closing
      break;
    }
    inner.push(lines[i]);
    i += 1;
  }
  const [kind, ...rest] = header.split(/\s+/);
  const argString = rest.join(" ").trim();
  switch (kind) {
    case "quiz":
      return { node: parseQuizBlock(inner), next: i };
    case "fill":
      return { node: parseFillBlock(inner), next: i };
    case "callout":
      return { node: parseCalloutBlock(inner, argString), next: i };
    case "steps":
      return { node: parseStepsBlock(inner), next: i };
    case "diagram":
      return { node: parseDiagramBlock(inner, argString), next: i };
    default:
      // Unknown block: render its inner content as ordinary markdown.
      return { node: { kind: "callout", tone: "note", body: parseRange(inner, 0, inner.length).nodes }, next: i };
  }
}

/** A `:::diagram <type>` block with `key: value` parameter lines. */
function parseDiagramBlock(lines: string[], diagramType: string): BlockNode {
  const params: Record<string, string> = {};
  for (const raw of lines) {
    const line = raw.trim();
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    params[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { kind: "diagram", diagramType, params };
}

/** A `:::steps` block wraps a markdown table that the learner reveals one row at a time. */
function parseStepsBlock(lines: string[]): BlockNode {
  const parsed = parseRange(lines, 0, lines.length).nodes;
  const tableIndex = parsed.findIndex((node) => node.kind === "table");
  if (tableIndex === -1) {
    // No table inside — fall back to plain rendering so content is never lost.
    return { kind: "callout", tone: "note", body: parsed };
  }
  const table = parsed[tableIndex] as Extract<BlockNode, { kind: "table" }>;
  return { kind: "steps", intro: parsed.slice(0, tableIndex), header: table.header, rows: table.rows };
}

function parseQuizBlock(lines: string[]): BlockNode {
  let question = "";
  const choices: { text: string; correct: boolean }[] = [];
  const explanationLines: string[] = [];
  let mode: "question" | "explanation" = "question";
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (t.startsWith("> ")) {
      mode = "explanation";
      explanationLines.push(t.slice(2));
      continue;
    }
    if (t.startsWith("* ")) {
      choices.push({ text: t.slice(2), correct: true });
      continue;
    }
    if (t.startsWith("- ")) {
      choices.push({ text: t.slice(2), correct: false });
      continue;
    }
    if (mode === "explanation") {
      explanationLines.push(t);
    } else {
      question = question ? `${question} ${t}` : t;
    }
  }
  return { kind: "quiz", question, choices, explanation: explanationLines.join(" ") };
}

function parseFillBlock(lines: string[]): BlockNode {
  let prompt = "";
  const explanationLines: string[] = [];
  let mode: "prompt" | "explanation" = "prompt";
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (t.startsWith("> ")) {
      mode = "explanation";
      explanationLines.push(t.slice(2));
      continue;
    }
    if (mode === "explanation") {
      explanationLines.push(t);
    } else {
      prompt = prompt ? `${prompt} ${t}` : t;
    }
  }
  // A blank is already visually distinct; drop any bold markers wrapping it
  // so the `**` does not leak into the rendered text.
  const cleaned = prompt.replace(/\*\*(\{\{[^}]+\}\})\*\*/g, "$1");
  return { kind: "fill", segments: parseFillSegments(cleaned), explanation: explanationLines.join(" ") };
}

function parseFillSegments(prompt: string): FillSegment[] {
  const segments: FillSegment[] = [];
  const re = /\{\{([^}]+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(prompt)) !== null) {
    if (match.index > last) {
      segments.push({ kind: "text", text: prompt.slice(last, match.index) });
    }
    segments.push({ kind: "blank", answer: match[1].trim() });
    last = match.index + match[0].length;
  }
  if (last < prompt.length) {
    segments.push({ kind: "text", text: prompt.slice(last) });
  }
  return segments;
}

function parseCalloutBlock(lines: string[], arg: string): BlockNode {
  const tone = (["tip", "warning", "key", "note"].includes(arg) ? arg : "note") as
    | "tip"
    | "warning"
    | "key"
    | "note";
  return { kind: "callout", tone, body: parseRange(lines, 0, lines.length).nodes };
}

// ---------- Renderer ----------

function renderBlock(block: BlockNode, key: number): ReactNode {
  switch (block.kind) {
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4";
      return <Tag key={key}>{renderInline(block.text)}</Tag>;
    }
    case "paragraph":
      return <p key={key}>{renderInline(block.text)}</p>;
    case "ul":
      return (
        <ul key={key}>
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key}>
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case "code":
      if (block.lang === "python-run") {
        return <RunnableCode key={key} initialCode={block.lines.join("\n")} />;
      }
      return (
        <pre key={key} data-lang={block.lang}>
          <code>{block.lines.join("\n")}</code>
        </pre>
      );
    case "table":
      return (
        <div className="lesson-table-wrap" key={key}>
          <table className="lesson-table">
            <thead>
              <tr>
                {block.header.map((cell, index) => (
                  <th key={index}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rIndex) => (
                <tr key={rIndex}>
                  {row.map((cell, cIndex) => (
                    <td key={cIndex}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "rule":
      return <hr key={key} />;
    case "quiz":
      return <QuizCard key={key} block={block} />;
    case "fill":
      return <FillCard key={key} block={block} />;
    case "callout":
      return <CalloutCard key={key} block={block} />;
    case "steps":
      return <StepsCard key={key} block={block} />;
    case "diagram":
      return <LessonDiagram key={key} type={block.diagramType} params={block.params} />;
    default:
      return null;
  }
}

function renderInline(line: string): ReactNode[] {
  // Order matters: handle code spans first so we don't mangle their contents.
  const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

// ---------- Interactive cards ----------

function QuizCard({ block }: { block: Extract<BlockNode, { kind: "quiz" }> }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { lessonTitle, onCheckpoint } = useContext(LessonContext);
  const reported = useRef(false);
  const correctIndex = block.choices.findIndex((choice) => choice.correct);
  const isCorrect = selected !== null && block.choices[selected].correct;

  return (
    <div className={`lesson-card quiz-card${revealed ? (isCorrect ? " is-correct" : " is-wrong") : ""}`}>
      <div className="lesson-card-head">
        <span className="lesson-card-tag">Check yourself</span>
      </div>
      <p className="lesson-card-q">{renderInline(block.question)}</p>
      <div className="lesson-card-choices">
        {block.choices.map((choice, index) => {
          const showCorrect = revealed && choice.correct;
          const showWrong = revealed && selected === index && !choice.correct;
          return (
            <button
              key={index}
              type="button"
              className={
                "lesson-card-choice" +
                (selected === index ? " is-selected" : "") +
                (showCorrect ? " is-correct" : "") +
                (showWrong ? " is-wrong" : "")
              }
              onClick={() => {
                if (!reported.current) {
                  reported.current = true;
                  onCheckpoint(choice.correct);
                }
                setSelected(index);
                setRevealed(true);
              }}
              disabled={revealed && selected === index}
            >
              <span className="lesson-card-bullet">{String.fromCharCode(65 + index)}</span>
              <span>{renderInline(choice.text)}</span>
            </button>
          );
        })}
      </div>
      {revealed ? (
        <div className="lesson-card-explain">
          <strong>{isCorrect ? "Correct." : "Not quite."}</strong>{" "}
          {!isCorrect && correctIndex >= 0 ? (
            <span>
              The answer is <strong>{String.fromCharCode(65 + correctIndex)}</strong>.{" "}
            </span>
          ) : null}
          {block.explanation ? <span>{renderInline(block.explanation)}</span> : null}
        </div>
      ) : null}
      {revealed && !isCorrect && selected !== null && correctIndex >= 0 ? (
        <div className="lesson-card-coach">
          <CoachAssist
            label="Ask the coach why"
            mode="auto"
            systemPrompt={LESSON_COACH_SYSTEM_PROMPT}
            seedPrompt={buildQuizCoachPrompt({
              lessonTitle,
              question: block.question,
              choices: block.choices.map((choice) => choice.text),
              pickedIndex: selected,
              correctIndex,
              explanation: block.explanation
            })}
          />
        </div>
      ) : null}
    </div>
  );
}

function FillCard({ block }: { block: Extract<BlockNode, { kind: "fill" }> }) {
  const blanks = block.segments.filter((segment): segment is { kind: "blank"; answer: string } => segment.kind === "blank");
  const [values, setValues] = useState<string[]>(() => blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { onCheckpoint } = useContext(LessonContext);
  const reported = useRef(false);

  const normalized = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const matches = (input: string, answer: string) => {
    const a = normalized(input);
    const b = normalized(answer);
    if (!a) return false;
    if (a === b) return true;
    // Accept any of pipe-separated alternates.
    return answer.split("|").map(normalized).includes(a);
  };

  const allCorrect = blanks.every((blank, index) => matches(values[index], blank.answer));

  let blankCounter = 0;
  return (
    <div className={`lesson-card fill-card${checked ? (allCorrect ? " is-correct" : " is-wrong") : ""}`}>
      <div className="lesson-card-head">
        <span className="lesson-card-tag">Fill in</span>
      </div>
      <p className="fill-card-prompt">
        {block.segments.map((segment, index) => {
          if (segment.kind === "text") return <span key={index}>{renderInline(segment.text)}</span>;
          const i = blankCounter;
          blankCounter += 1;
          const ok = checked && matches(values[i], segment.answer);
          const bad = checked && !ok;
          return (
            <input
              key={index}
              type="text"
              aria-label={`Fill in blank ${i + 1}`}
              className={"fill-card-blank" + (ok ? " is-correct" : "") + (bad ? " is-wrong" : "")}
              value={revealed ? segment.answer : values[i]}
              onChange={(event) =>
                setValues((current) => {
                  const next = [...current];
                  next[i] = event.target.value;
                  return next;
                })
              }
              size={Math.max(segment.answer.length + 2, 6)}
              autoComplete="off"
              spellCheck={false}
            />
          );
        })}
      </p>
      <div className="lesson-card-actions">
        <button
          type="button"
          className="lesson-card-btn primary"
          onClick={() => {
            if (!reported.current) {
              reported.current = true;
              onCheckpoint(allCorrect);
            }
            setRevealed(false);
            setChecked(true);
          }}
        >
          Check
        </button>
        <button
          type="button"
          className="lesson-card-btn"
          onClick={() => {
            // Revealing before a correct check counts as a missed checkpoint.
            if (!reported.current) {
              reported.current = true;
              onCheckpoint(false);
            }
            setRevealed(true);
            setChecked(true);
          }}
        >
          Reveal
        </button>
      </div>
      {checked ? (
        <div className="lesson-card-explain">
          <strong>{allCorrect ? "Correct." : revealed ? "Answer shown." : "Try again."}</strong>{" "}
          {block.explanation ? <span>{renderInline(block.explanation)}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function CalloutCard({ block }: { block: Extract<BlockNode, { kind: "callout" }> }) {
  const icon =
    block.tone === "warning" ? <AlertTriangle size={18} /> :
    block.tone === "tip" ? <Lightbulb size={18} /> :
    block.tone === "key" ? <Key size={18} /> :
    <Info size={18} />;
  const label =
    block.tone === "warning" ? "Watch out" :
    block.tone === "tip" ? "Tip" :
    block.tone === "key" ? "Key idea" :
    "Note";
  return (
    <aside className={`lesson-callout tone-${block.tone}`}>
      <div className="lesson-callout-head">
        {icon}
        <span>{label}</span>
      </div>
      <div className="lesson-callout-body">{block.body.map((child, index) => renderBlock(child, index))}</div>
    </aside>
  );
}

function StepsCard({ block }: { block: Extract<BlockNode, { kind: "steps" }> }) {
  // Start with just the first step visible; the learner reveals the rest.
  const [shown, setShown] = useState(1);
  const total = block.rows.length;
  const done = shown >= total;

  return (
    <div className="lesson-card steps-card">
      <div className="lesson-card-head">
        <span className="lesson-card-tag">Trace it</span>
        <span className="steps-card-count">
          step {Math.min(shown, total)} of {total}
        </span>
      </div>
      {block.intro.length ? (
        <div className="steps-card-intro">{block.intro.map((child, index) => renderBlock(child, index))}</div>
      ) : null}
      <div className="lesson-table-wrap">
        <table className="lesson-table">
          <thead>
            <tr>
              {block.header.map((cell, index) => (
                <th key={index}>{renderInline(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.slice(0, shown).map((row, rIndex) => (
              <tr key={rIndex} className={shown > 1 && rIndex === shown - 1 ? "steps-row-new" : ""}>
                {row.map((cell, cIndex) => (
                  <td key={cIndex}>{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {done ? (
        <p className="steps-card-done">Trace complete — every step is shown.</p>
      ) : (
        <div className="steps-card-foot">
          <span className="steps-card-hint">Predict the next row in your head, then reveal it.</span>
          <div className="steps-card-actions">
            <button type="button" className="lesson-card-btn primary" onClick={() => setShown((value) => value + 1)}>
              Reveal next step
            </button>
            <button type="button" className="lesson-card-btn" onClick={() => setShown(total)}>
              Show all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
