import type { ReactNode } from "react";

export function MarkdownView({ content }: { content: string }) {
  return <div className="markdown">{renderMarkdown(content)}</div>;
}

function renderMarkdown(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = content.trim().split("\n");
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let inCode = false;

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
  return nodes;
}

function renderInline(line: string): ReactNode[] {
  // Split into inline-code spans, **bold** spans, and plain text.
  const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
