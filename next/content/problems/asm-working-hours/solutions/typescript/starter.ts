export function solution(queries: string[][]): string[] {
  const workers = new Map<string, unknown>();
  const result: string[] = [];

  for (const query of queries) {
    switch (query[0]) {
      case "ADD_WORKER":
        result.push("");
        break;
      case "REGISTER":
        result.push("");
        break;
      case "GET":
        result.push("");
        break;
      case "TOP_N_WORKERS":
        result.push("");
        break;
      case "PROMOTE":
        result.push("");
        break;
      case "CALC_SALARY":
        result.push("");
        break;
      case "SET_DOUBLE_PAY":
        result.push("");
        break;
      default:
        result.push("");
    }
  }

  return result;
}
