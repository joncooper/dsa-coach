/**
 * Small, purpose-built SVG diagrams for the spatial data-structure concepts
 * (arrays/windows, linked lists, trees, heaps). Authored from a `:::diagram`
 * block whose first token is the diagram type and whose body is `key: value`
 * parameter lines.
 */
export function LessonDiagram({ type, params }: { type: string; params: Record<string, string> }) {
  if (type === "array") return <ArrayDiagram params={params} />;
  if (type === "linked-list") return <LinkedListDiagram params={params} />;
  if (type === "tree" || type === "heap") return <TreeDiagram params={params} heap={type === "heap"} />;
  return null;
}

function caption(params: Record<string, string>) {
  return params.caption ? <figcaption className="lesson-diagram-caption">{params.caption}</figcaption> : null;
}

// ---------- Array / sliding window ----------

function ArrayDiagram({ params }: { params: Record<string, string> }) {
  const values = (params.values ?? "").trim().split(/\s+/).filter(Boolean);
  const lo = params.lo !== undefined ? Number(params.lo) : null;
  const hi = params.hi !== undefined ? Number(params.hi) : null;
  const loLabel = params.loLabel ?? "left";
  const hiLabel = params.hiLabel ?? "right";

  const cell = 46;
  const gap = 6;
  const padX = 14;
  const padTop = 14;
  const rowY = padTop + (lo !== null || hi !== null ? 34 : 0);
  const width = padX * 2 + values.length * cell + (values.length - 1) * gap;
  const height = rowY + cell + 22;

  const cellX = (i: number) => padX + i * (cell + gap);

  return (
    <figure className="lesson-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={params.caption ?? "Array diagram"}>
        {values.map((value, i) => {
          const inWindow = lo !== null && hi !== null && i >= lo && i <= hi;
          return (
            <g key={i}>
              <rect
                x={cellX(i)}
                y={rowY}
                width={cell}
                height={cell}
                rx={6}
                className={inWindow ? "diag-cell diag-cell-window" : "diag-cell"}
              />
              <text x={cellX(i) + cell / 2} y={rowY + cell / 2 + 5} className="diag-cell-text">
                {value}
              </text>
              <text x={cellX(i) + cell / 2} y={rowY + cell + 15} className="diag-index">
                {i}
              </text>
            </g>
          );
        })}
        {lo !== null ? <Pointer x={cellX(lo) + cell / 2} y={rowY} label={loLabel} /> : null}
        {hi !== null && hi !== lo ? <Pointer x={cellX(hi) + cell / 2} y={rowY} label={hiLabel} /> : null}
        {hi !== null && hi === lo ? <Pointer x={cellX(hi) + cell / 2} y={rowY} label={`${loLabel} / ${hiLabel}`} /> : null}
      </svg>
      {caption(params)}
    </figure>
  );
}

function Pointer({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g className="diag-pointer">
      <text x={x} y={y - 18} className="diag-pointer-label">
        {label}
      </text>
      <path d={`M ${x - 5} ${y - 13} L ${x + 5} ${y - 13} L ${x} ${y - 4} Z`} className="diag-pointer-arrow" />
    </g>
  );
}

// ---------- Linked list ----------

function LinkedListDiagram({ params }: { params: Record<string, string> }) {
  const values = (params.values ?? "").trim().split(/\s+/).filter(Boolean);
  const dummy = params.dummy === "true";
  const highlight = params.highlight !== undefined ? Number(params.highlight) : null;

  const nodeW = 56;
  const nodeH = 42;
  const arrow = 34;
  const padX = 12;
  const padY = 14;
  // Nodes: optional dummy, the values, then a terminal "None".
  const cells: { label: string; kind: "dummy" | "node" | "null"; index: number }[] = [];
  if (dummy) cells.push({ label: "dummy", kind: "dummy", index: -1 });
  values.forEach((value, i) => cells.push({ label: value, kind: "node", index: i }));
  cells.push({ label: "None", kind: "null", index: -2 });

  const width = padX * 2 + cells.length * nodeW + (cells.length - 1) * arrow;
  const height = padY * 2 + nodeH;
  const nodeX = (i: number) => padX + i * (nodeW + arrow);

  return (
    <figure className="lesson-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={params.caption ?? "Linked list diagram"}>
        {cells.map((node, i) => {
          const x = nodeX(i);
          const isHL = node.kind === "node" && node.index === highlight;
          const className =
            node.kind === "dummy"
              ? "diag-node diag-node-dummy"
              : node.kind === "null"
                ? "diag-node diag-node-null"
                : isHL
                  ? "diag-node diag-node-hl"
                  : "diag-node";
          return (
            <g key={i}>
              {i < cells.length - 1 ? (
                <line
                  x1={x + nodeW}
                  y1={padY + nodeH / 2}
                  x2={x + nodeW + arrow - 7}
                  y2={padY + nodeH / 2}
                  className="diag-arrow"
                  markerEnd="url(#arrowhead)"
                />
              ) : null}
              <rect x={x} y={padY} width={nodeW} height={nodeH} rx={node.kind === "null" ? 21 : 7} className={className} />
              <text x={x + nodeW / 2} y={padY + nodeH / 2 + 5} className="diag-node-text">
                {node.label}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="diag-arrowhead" />
          </marker>
        </defs>
      </svg>
      {caption(params)}
    </figure>
  );
}

// ---------- Binary tree / heap ----------

function TreeDiagram({ params, heap }: { params: Record<string, string>; heap: boolean }) {
  // Level-order values; `_` or `null` marks an absent node.
  const raw = (params.levels ?? "").trim().split(/\s+/).filter(Boolean);
  const nodes = raw.map((token) => (token === "_" || token === "null" ? null : token));
  const showIndices = params.indices === "true" || heap;

  const depth = Math.max(1, Math.ceil(Math.log2(nodes.length + 1)));
  const width = 60 * Math.pow(2, depth - 1) + 40;
  const levelGap = 78;
  const height = depth * levelGap + 36;
  const radius = 19;

  // Slot-based layout: index i sits at a fixed grid position so absent nodes
  // simply leave a gap and siblings never shift.
  const pos = (i: number) => {
    const level = Math.floor(Math.log2(i + 1));
    const slot = i - (Math.pow(2, level) - 1);
    const capacity = Math.pow(2, level);
    return { x: ((slot + 0.5) / capacity) * width, y: 30 + level * levelGap };
  };

  return (
    <figure className="lesson-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={params.caption ?? "Tree diagram"}>
        {/* Edges first so nodes draw on top. */}
        {nodes.map((value, i) => {
          if (value === null) return null;
          const here = pos(i);
          return [i * 2 + 1, i * 2 + 2].map((childIndex) => {
            if (childIndex >= nodes.length || nodes[childIndex] === null) return null;
            const child = pos(childIndex);
            return (
              <line key={`${i}-${childIndex}`} x1={here.x} y1={here.y} x2={child.x} y2={child.y} className="diag-edge" />
            );
          });
        })}
        {nodes.map((value, i) => {
          if (value === null) return null;
          const here = pos(i);
          return (
            <g key={i}>
              <circle cx={here.x} cy={here.y} r={radius} className="diag-tree-node" />
              <text x={here.x} y={here.y + 5} className="diag-node-text">
                {value}
              </text>
              {showIndices ? (
                <text x={here.x + radius + 2} y={here.y - radius + 4} className="diag-tree-index">
                  [{i}]
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {caption(params)}
    </figure>
  );
}
