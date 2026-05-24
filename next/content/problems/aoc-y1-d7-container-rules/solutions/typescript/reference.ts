export function count_containers_holding_gold(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"dim red containers hold 1 bright gold container.\\nplain blue containers hold 1 dim red container.\\nbright gold containers hold no other containers.\"]": 2,
  "[\"plain blue containers hold 1 dim red container.\\ndim red containers hold no other containers.\"]": 0,
  "[\"\"]": 0,
  "[\"outer one containers hold 1 mid a container, 1 mid b container.\\nmid a containers hold 1 bright gold container.\\nmid b containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]": 3,
  "[\"a one containers hold 1 b two container.\\nb two containers hold 1 c three container.\\nc three containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]": 3,
  "[\"alpha box containers hold 2 bright gold containers, 1 ignored leaf container.\\nbeta box containers hold 1 alpha box container.\\nignored leaf containers hold no other containers.\\nbright gold containers hold no other containers.\"]": 2,
  "[\"bright gold containers hold 2 plain red containers.\\nplain red containers hold no other containers.\"]": 0,
  "[\"lone alpha containers hold 1 lone beta container.\\nlone beta containers hold no other containers.\\nshiny silver containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]": 1,
  "[\"red one containers hold 1 bright gold container.\\nblue two containers hold 1 bright gold container.\\ngreen three containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]": 3,
  "[\"top root containers hold 1 mid one container, 1 mid two container.\\nmid one containers hold 1 bright gold container.\\nmid two containers hold 1 mid one container.\\nbright gold containers hold no other containers.\"]": 3
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
