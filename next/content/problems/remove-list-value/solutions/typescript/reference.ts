export function removeListValue(values: number[], target: number): number[] | null {
  const result = values.filter((value) => value !== target);
  if (values.length === 1 && result.length === 0) return null;
  return result;
}
