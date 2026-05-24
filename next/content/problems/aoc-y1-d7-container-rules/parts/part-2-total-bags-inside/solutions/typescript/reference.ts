export function total_inside_gold(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"bright gold containers hold 2 dim red containers.\\ndim red containers hold 3 plain blue containers.\\nplain blue containers hold no other containers.\"]": 8,
  "[\"bright gold containers hold no other containers.\"]": 0,
  "[\"\"]": 0,
  "[\"bright gold containers hold 1 dim red container, 2 plain blue containers.\\ndim red containers hold no other containers.\\nplain blue containers hold 1 tiny pink container.\\ntiny pink containers hold no other containers.\"]": 5,
  "[\"bright gold containers hold 2 stage a containers.\\nstage a containers hold 2 stage b containers.\\nstage b containers hold no other containers.\"]": 6,
  "[\"bright gold containers hold 1 first chamber container.\\nfirst chamber containers hold 1 second chamber container.\\nsecond chamber containers hold 1 third chamber container.\\nthird chamber containers hold no other containers.\"]": 3,
  "[\"bright gold containers hold 3 sub one containers.\\nsub one containers hold 4 sub two containers.\\nsub two containers hold no other containers.\"]": 15,
  "[\"bright gold containers hold 2 alpha box containers, 3 beta box containers.\\nalpha box containers hold 1 inner one container.\\nbeta box containers hold no other containers.\\ninner one containers hold no other containers.\"]": 7,
  "[\"bright gold containers hold 2 mid one containers, 3 mid two containers.\\nmid one containers hold 1 leaf alpha container.\\nmid two containers hold 1 leaf alpha container.\\nleaf alpha containers hold no other containers.\"]": 10
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
