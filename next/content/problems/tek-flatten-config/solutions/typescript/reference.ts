export function flattenConfig(config: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (node: Record<string, unknown>, prefix: string) => {
    for (const [key, value] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (isPlainObject(value)) walk(value, path);
      else out[path] = value;
    }
  };
  walk(config, "");
  return out;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
