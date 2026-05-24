export function renderTemplate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g, (match, name: string) => {
    return Object.hasOwn(values, name) ? pyString(values[name]) : match;
  });
}

function pyString(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(pyString).join(", ")}]`;
  if (typeof value === "boolean") return value ? "True" : "False";
  if (value === null) return "None";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
