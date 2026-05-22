import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownView } from "../src/components/MarkdownView";

/**
 * KaTeX emits a visually-hidden `.katex-mathml` subtree carrying the raw TeX
 * source (for screen readers and copy-paste). Strip it so assertions see only
 * what the learner actually reads on screen.
 */
function visibleText(container: HTMLElement): string {
  container.querySelectorAll(".katex-mathml").forEach((el) => el.remove());
  return container.textContent ?? "";
}

describe("MarkdownView — math rendering", () => {
  it("typesets inline $...$ math and drops the delimiters", () => {
    const { container } = render(
      <MarkdownView content={"Count each pair $\\{i, j\\}$ where $i < j$."} />
    );
    expect(container.querySelectorAll(".katex")).toHaveLength(2);
    expect(visibleText(container)).not.toContain("$");
  });

  it("typesets inline \\(...\\) math", () => {
    const { container } = render(
      <MarkdownView content={"This runs in \\(n \\log n\\) time."} />
    );
    expect(container.querySelectorAll(".katex")).toHaveLength(1);
    expect(visibleText(container)).not.toContain("\\(");
  });

  it("renders a fenced $$...$$ block as display math", () => {
    const { container } = render(
      <MarkdownView content={"The closed form:\n$$\n\\sum_{i=1}^{n} i\n$$\nis handy."} />
    );
    expect(container.querySelector(".math-block .katex-display")).not.toBeNull();
    expect(visibleText(container)).toContain("is handy.");
  });

  it("renders single-line $$...$$ and \\[...\\] display math", () => {
    const dollars = render(<MarkdownView content={"$$a^2 + b^2 = c^2$$"} />);
    expect(dollars.container.querySelector(".math-block .katex-display")).not.toBeNull();

    const brackets = render(<MarkdownView content={"\\[a^2 + b^2 = c^2\\]"} />);
    expect(brackets.container.querySelector(".math-block .katex-display")).not.toBeNull();
  });

  it("leaves a $ inside inline code untouched", () => {
    const { container } = render(<MarkdownView content={"Run `echo $HOME` first."} />);
    expect(container.querySelector("code")?.textContent).toBe("echo $HOME");
    expect(container.querySelector(".katex")).toBeNull();
  });

  it("does not throw on half-streamed TeX", () => {
    // No closing `$` yet — must stay plain text, not crash, not typeset.
    const open = render(<MarkdownView content={"Almost there: $\\frac{n}{"} />);
    expect(open.container.querySelector(".katex")).toBeNull();

    // Closed but malformed — KaTeX degrades to a red error span, never throws.
    expect(() => render(<MarkdownView content={"Broken: $\\frac{n}{$"} />)).not.toThrow();
  });

  it("still renders headings, lists, **bold** and `code`", () => {
    const { container } = render(
      <MarkdownView content={"# Title\n\n- **bold** point\n- `code` point"} />
    );
    expect(container.querySelector("h1")?.textContent).toBe("Title");
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("code")?.textContent).toBe("code");
  });
});
