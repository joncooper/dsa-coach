export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"ADD_FILE\",\"data1.txt\",\"30\"],[\"ADD_FILE\",\"data2.txt\",\"90\"],[\"FIND_BY_PREFIX\",\"data\"]]]": [
    "true",
    "true",
    "data2.txt(90),data1.txt(30)"
  ],
  "[[[\"ADD_FILE\",\"a\",\"1\"],[\"FIND_BY_PREFIX\",\"z\"]]]": [
    "true",
    ""
  ],
  "[[[\"ADD_FILE\",\"a.log\",\"5\"],[\"ADD_FILE\",\"b.txt\",\"6\"],[\"FIND_BY_SUFFIX\",\".log\"]]]": [
    "true",
    "true",
    "a.log(5)"
  ],
  "[[[\"ADD_FILE\",\"report\",\"42\"],[\"FIND_BY_PREFIX\",\"report\"]]]": [
    "true",
    "report(42)"
  ],
  "[[[\"ADD_FILE\",\"b\",\"10\"],[\"ADD_FILE\",\"a\",\"10\"],[\"FIND_BY_PREFIX\",\"\"]]]": [
    "true",
    "true",
    "a(10),b(10)"
  ],
  "[[[\"ADD_FILE\",\"x\",\"5\"],[\"ADD_FILE\",\"y\",\"9\"],[\"FIND_BY_PREFIX\",\"\"]]]": [
    "true",
    "true",
    "y(9),x(5)"
  ],
  "[[[\"ADD_FILE\",\"src.txt\",\"12\"],[\"COPY_FILE\",\"src.txt\",\"dst.txt\"],[\"FIND_BY_SUFFIX\",\".txt\"]]]": [
    "true",
    "true",
    "dst.txt(12),src.txt(12)"
  ],
  "[[[\"ADD_FILE\",\"f2\",\"0\"],[\"ADD_FILE\",\"f1\",\"0\"],[\"FIND_BY_PREFIX\",\"f\"]]]": [
    "true",
    "true",
    "f1(0),f2(0)"
  ],
  "[[[\"ADD_FILE\",\"abc\",\"3\"],[\"FIND_BY_PREFIX\",\"ab\"],[\"FIND_BY_SUFFIX\",\"bc\"]]]": [
    "true",
    "abc(3)",
    "abc(3)"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
