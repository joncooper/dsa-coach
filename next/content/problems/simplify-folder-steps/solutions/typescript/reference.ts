export function simplifyFolderSteps(steps: string[]): string {
  const stack: string[] = [];
  for (const step of steps) {
    if (step === "." || step === "") continue;
    if (step === "..") {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(step);
    }
  }
  return `/${stack.join("/")}`;
}
