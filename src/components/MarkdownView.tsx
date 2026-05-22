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
  const lines = content.trim().split("\n");
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let mathLines: string[] = [];
  let inCode = false;
  let inMath = false;

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {listItems.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const flushCode = () => {
    if (!codeLines.length) return;
    nodes.push(
      <pre key={`code-${nodes.length}`}>
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
  };

  const flushMath = () => {
    if (!mathLines.length) return;
    nodes.push(mathNode(mathLines.join("\n"), true, `math-${nodes.length}`));
    mathLines = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        flushList();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    // Display-math fence: a line that is exactly `$$`, `\[` or `\]` opens or
    // closes a multi-line math block — a toggle, like the ``` code fence.
    const trimmed = line.trim();
    if (trimmed === "$$" || trimmed === "\\[" || trimmed === "\\]") {
      if (inMath) {
        inMath = false;
        flushMath();
      } else {
        flushList();
        inMath = true;
      }
      return;
    }

    if (inMath) {
      mathLines.push(line);
      return;
    }

    // Single-line display math: `$$...$$` or `\[...\]` on its own line.
    const display = displayMath(trimmed);
    if (display !== null) {
      flushList();
      nodes.push(mathNode(display, true, `math-${nodes.length}`));
      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();
    if (line.startsWith("# ")) {
      nodes.push(<h1 key={`h1-${nodes.length}`}>{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      nodes.push(<h2 key={`h2-${nodes.length}`}>{line.slice(3)}</h2>);
    } else if (line.trim()) {
      nodes.push(<p key={`p-${nodes.length}`}>{renderInline(line)}</p>);
    }
  });

  flushList();
  flushCode();
  flushMath();
  return nodes;
}

function renderInline(line: string): ReactNode[] {
  // Split into inline-code, **bold**, and inline-math spans (`$...$` or
  // `\(...\)`), with plain text in between. Code is matched first so a `$`
  // inside backticks stays literal. The `$...$` form is greedy enough that a
  // line carrying two literal dollar amounts could be mis-split as math —
  // a non-issue for this coach, whose domain never quotes prices.
  const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\$[^$\n]+\$|\\\([^\n]+?\\\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
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
