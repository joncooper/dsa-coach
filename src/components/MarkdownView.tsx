import katex from "katex";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

export function MarkdownView({ content }: { content: string }) {
  return <div className="markdown">{renderMarkdown(content)}</div>;
}

/**
 * Render a TeX string to a KaTeX node. `throwOnError: false` makes malformed
 * or half-streamed TeX degrade to red source text instead of throwing — the
 * coach response is re-rendered on every chunk while it streams in, so a
 * partially-arrived expression must never crash the panel.
 */
function mathNode(tex: string, displayMode: boolean, key: string): ReactNode {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode });
  if (displayMode) {
    return <div key={key} className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span key={key} className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * A whole-line display-math block: `$$...$$` or `\[...\]`. Returns the inner
 * TeX, or null when the line is not single-line display math.
 */
function displayMath(line: string): string | null {
  if (line.length > 4 && line.startsWith("$$") && line.endsWith("$$")) {
    return line.slice(2, -2).trim();
  }
  if (line.length > 4 && line.startsWith("\\[") && line.endsWith("\\]")) {
    return line.slice(2, -2).trim();
  }
  return null;
}

function renderMarkdown(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = content.trim().split(/\r?\n/);
  let listItems: string[] = [];
  let listOrdered = false;
  let paragraphLines: string[] = [];
  let codeLines: string[] = [];
  let codeLanguage = "";
  let mathLines: string[] = [];
  let inCode = false;
  let inMath = false;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    nodes.push(<p key={`p-${nodes.length}`}>{renderInline(paragraphLines.join(" "))}</p>);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const Tag = listOrdered ? "ol" : "ul";
    nodes.push(
      <Tag key={`${Tag}-${nodes.length}`}>
        {listItems.map((item, index) => (
          <li key={`${index}-${item}`}>{renderInline(item)}</li>
        ))}
      </Tag>
    );
    listItems = [];
    listOrdered = false;
  };

  const flushCode = () => {
    if (!codeLines.length) return;
    nodes.push(
      <div key={`code-${nodes.length}`} className="markdown-code-block">
        {codeLanguage ? <div className="markdown-code-label">{codeLanguage}</div> : null}
        <pre>
          <code>{codeLines.join("\n")}</code>
        </pre>
      </div>
    );
    codeLines = [];
    codeLanguage = "";
  };

  const flushMath = () => {
    if (!mathLines.length) return;
    nodes.push(mathNode(mathLines.join("\n"), true, `math-${nodes.length}`));
    mathLines = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("```")) {
      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        flushParagraph();
        flushList();
        inCode = true;
        codeLanguage = line.slice(3).trim().split(/\s+/)[0] ?? "";
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Display-math fence: a line that is exactly `$$`, `\[` or `\]` opens or
    // closes a multi-line math block — a toggle, like the ``` code fence.
    const trimmed = line.trim();
    if (trimmed === "$$" || trimmed === "\\[" || trimmed === "\\]") {
      if (inMath) {
        inMath = false;
        flushMath();
      } else {
        flushParagraph();
        flushList();
        inMath = true;
      }
      continue;
    }

    if (inMath) {
      mathLines.push(line);
      continue;
    }

    // Single-line display math: `$$...$$` or `\[...\]` on its own line.
    const display = displayMath(trimmed);
    if (display !== null) {
      flushParagraph();
      flushList();
      nodes.push(mathNode(display, true, `math-${nodes.length}`));
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isTableStart(lines, index)) {
      flushParagraph();
      flushList();
      const table = collectTable(lines, index);
      nodes.push(renderTable(table.rows, `table-${nodes.length}`));
      index = table.nextIndex - 1;
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      if (listItems.length && listOrdered) flushList();
      listOrdered = false;
      listItems.push(unordered[1]);
      continue;
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (listItems.length && !listOrdered) flushList();
      listOrdered = true;
      listItems.push(ordered[1]);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const body = renderInline(heading[2]);
      if (level === 1) nodes.push(<h1 key={`h1-${nodes.length}`}>{body}</h1>);
      else if (level === 2) nodes.push(<h2 key={`h2-${nodes.length}`}>{body}</h2>);
      else if (level === 3) nodes.push(<h3 key={`h3-${nodes.length}`}>{body}</h3>);
      else nodes.push(<h4 key={`h4-${nodes.length}`}>{body}</h4>);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      nodes.push(<blockquote key={`quote-${nodes.length}`}>{renderInline(quote[1])}</blockquote>);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushCode();
  flushMath();
  return nodes;
}

function isTableStart(lines: string[], index: number): boolean {
  const header = lines[index]?.trim();
  const separator = lines[index + 1]?.trim();
  return Boolean(header && separator && parseTableRow(header).length > 1 && isTableSeparator(separator));
}

function collectTable(lines: string[], startIndex: number): { rows: string[][]; nextIndex: number } {
  const rows: string[][] = [];
  let index = startIndex;
  rows.push(parseTableRow(lines[index]));
  index += 2; // Skip the separator row.
  while (index < lines.length) {
    const trimmed = lines[index].trim();
    if (!trimmed || !trimmed.includes("|")) break;
    const row = parseTableRow(trimmed);
    if (row.length < 2) break;
    rows.push(row);
    index += 1;
  }
  return { rows, nextIndex: index };
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const cells = parseTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderTable(rows: string[][], key: string): ReactNode {
  const [head = [], ...body] = rows;
  return (
    <div key={key} className="markdown-table-wrap">
      <table>
        <thead>
          <tr>
            {head.map((cell, index) => <th key={`${index}-${cell}`}>{renderInline(cell)}</th>)}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row.join("|")}`}>
              {head.map((_, cellIndex) => (
                <td key={`${cellIndex}-${row[cellIndex] ?? ""}`}>{renderInline(row[cellIndex] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderInline(line: string): ReactNode[] {
  // Split into inline-code, **bold**, and inline-math spans (`$...$` or
  // `\(...\)`), with plain text in between. Code is matched first so a `$`
  // inside backticks stays literal. The `$...$` form is greedy enough that a
  // line carrying two literal dollar amounts could be mis-split as math —
  // a non-issue for this coach, whose domain never quotes prices.
  const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\$[^$\n]+\$|\\\([^\n]+?\\\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }
    if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
      return mathNode(part.slice(1, -1), false, `${part}-${index}`);
    }
    if (part.length > 4 && part.startsWith("\\(") && part.endsWith("\\)")) {
      return mathNode(part.slice(2, -2), false, `${part}-${index}`);
    }
    return part;
  });
}
