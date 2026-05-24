export function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let index = 0;
  while (index < line.length) {
    const ch = line[index];
    if (inQuotes) {
      if (ch === "\"") {
        if (index + 1 < line.length && line[index + 1] === "\"") { current += "\""; index += 2; continue; }
        inQuotes = false; index += 1; continue;
      }
      current += ch; index += 1;
    } else if (ch === "\"" && current.length === 0) { inQuotes = true; index += 1; }
    else if (ch === ",") { fields.push(current); current = ""; index += 1; }
    else { current += ch; index += 1; }
  }
  fields.push(current);
  return fields;
}
