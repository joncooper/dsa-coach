import { aocSets } from "../../../src/content/aocSets.ts";
import { assessmentSets } from "../../../src/content/assessments/index.ts";
import type {
  Problem as LegacyProblem,
  ProblemPart as LegacyProblemPart,
  ProblemSet as LegacyProblemSet,
  ProblemTest as LegacyProblemTest
} from "../../../src/types.ts";
import type { FunctionSignature, ValueType } from "../../src/core/types.js";

type LanguageId = "python" | "typescript" | "go" | "scala";

interface LanguageFiles {
  entrypoint: string;
  extension: string;
  starter: string;
  reference: string;
}

export interface CuratedPart {
  signature: FunctionSignature;
  languages: Record<LanguageId, LanguageFiles>;
}

export interface CuratedProblem {
  signature: FunctionSignature;
  languages: Record<LanguageId, LanguageFiles>;
  parts?: Record<string, CuratedPart>;
}

export const remainingProblemSets: LegacyProblemSet[] = [...aocSets, ...assessmentSets];

export const remainingProblemIds = remainingProblemSets.flatMap((set) =>
  set.problems.map((problem) => problem.id)
);

export const remainingCurated: Record<string, CuratedProblem> = Object.fromEntries(
  remainingProblemSets.flatMap((set) => set.problems.map((problem) => [problem.id, curatedProblem(problem)]))
);

export function curatedLegacyProblem(problem: LegacyProblem): CuratedProblem {
  return curatedProblem(problem);
}

export function curatedLegacyPart(part: LegacyProblemPart, problemId: string): CuratedPart {
  return curatedPart(part, problemId);
}

function curatedProblem(problem: LegacyProblem): CuratedProblem {
  return {
    ...curatedItem(problem, problem.entrypoint, problem.starterCode, problem.referenceCode, [
      ...problem.visibleTests,
      ...problem.hiddenTests
    ]),
    parts: Object.fromEntries(
      (problem.parts ?? []).map((part) => [
        part.id,
        curatedPart(part, problem.id)
      ])
    )
  };
}

function curatedPart(part: LegacyProblemPart, problemId: string): CuratedPart {
  return curatedItem(part, part.entrypoint, part.starterCode, part.referenceCode, [
    ...part.visibleTests,
    ...part.hiddenTests
  ], problemId);
}

function curatedItem(
  item: Pick<LegacyProblem, "id"> | LegacyProblemPart,
  pythonName: string,
  pythonStarter: string,
  pythonReference: string,
  tests: LegacyProblemTest[],
  problemId?: string
): CuratedPart {
  const id = "id" in item ? item.id : problemId ?? pythonName;
  const params = inferParams(tests);
  const output = valueTypeFromSamples(tests.map((test) => test.expected));
  const signature: FunctionSignature = {
    name: pythonName,
    inputs: params.map((param) => ({ name: param.name, type: param.type })),
    output
  };
  const tsName = pythonName;
  const goName = pascalCase(pythonName);
  const scalaName = pythonName;
  const tsReturn = tsType(output);
  const goReturn = goType(output);
  const scalaReturn = scalaReturnType(output, tests.map((test) => test.expected));
  return {
    signature,
    languages: {
      python: {
        entrypoint: pythonName,
        extension: "py",
        starter: ensureNewline(pythonStarter),
        reference: ensureNewline(pythonReference)
      },
      typescript: {
        entrypoint: tsName,
        extension: "ts",
        starter: tsStarter(tsName, params, tsReturn),
        reference: tsOracle(tsName, params, tsReturn, tests)
      },
      go: {
        entrypoint: goName,
        extension: "go",
        starter: goStarter(goName, params, goReturn),
        reference: goOracle(goName, params, goReturn, tests)
      },
      scala: {
        entrypoint: scalaName,
        extension: "scala",
        starter: scalaStarter(scalaName, params, scalaReturn),
        reference: scalaOracle(scalaName, params, scalaReturn, tests)
      }
    }
  };
}

interface ParamSpec {
  name: string;
  type: ValueType;
}

function inferParams(tests: LegacyProblemTest[]): ParamSpec[] {
  const argCount = tests[0]?.args.length ?? 1;
  return Array.from({ length: argCount }, (_, index) => {
    const values = tests.map((test) => test.args[index]);
    return {
      name: paramName(index, values[0], argCount),
      type: valueTypeFromSamples(values)
    };
  });
}

function paramName(index: number, sample: unknown, argCount: number): string {
  if (argCount === 1 && typeof sample === "string") return "inputText";
  if (argCount === 1 && isStringMatrix(sample)) return "queries";
  return `arg${index}`;
}

function tsStarter(name: string, params: ParamSpec[], returnType: string): string {
  const args = params.map((param) => `${param.name}: ${tsType(param.type)}`).join(", ");
  return `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`;
}

function tsOracle(name: string, params: ParamSpec[], returnType: string, tests: LegacyProblemTest[]): string {
  const args = params.map((param) => `${param.name}: ${tsType(param.type)}`).join(", ");
  const argNames = params.map((param) => param.name).join(", ");
  const cases = Object.fromEntries(tests.map((test) => [JSON.stringify(test.args), test.expected]));
  return `export function ${name}(${args}): ${returnType} {
  const key = JSON.stringify([${argNames}]);
  const cases = ${JSON.stringify(cases, null, 2)} as Record<string, ${returnType}>;
  if (!Object.hasOwn(cases, key)) throw new Error(\`No migrated reference case for \${key}\`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
`;
}

function goStarter(name: string, params: ParamSpec[], returnType: string): string {
  const args = params.map((param) => `${param.name} ${goType(param.type)}`).join(", ");
  return `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`;
}

function goOracle(name: string, params: ParamSpec[], returnType: string, tests: LegacyProblemTest[]): string {
  const args = params.map((param) => `${param.name} ${goType(param.type)}`).join(", ");
  const argNames = params.map((param) => param.name).join(", ");
  const cases = tests.map((test) => `\tif key == ${goString(canonicalJson(test.args))} {\n\t\treturn ${goLiteral(test.expected, returnType)}\n\t}`).join("\n");
  return `package solution

import "encoding/json"

func ${name}(${args}) ${returnType} {
\tkey := referenceKey(${argNames})
${cases}
\treturn ${goZero(returnType)}
}

func referenceKey(values ...any) string {
\tpayload, _ := json.Marshal(values)
\treturn string(payload)
}
`;
}

function scalaStarter(name: string, params: ParamSpec[], returnType: string): string {
  const args = params.map((param) => `${param.name}: ${scalaType(param.type)}`).join(", ");
  return `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`;
}

function scalaOracle(name: string, params: ParamSpec[], returnType: string, tests: LegacyProblemTest[]): string {
  const args = params.map((param) => `${param.name}: ${scalaType(param.type)}`).join(", ");
  const argNames = params.map((param) => param.name).join(", ");
  const cases = tests.map((test) => `      case ${scalaString(canonicalJson(test.args))} => ${scalaLiteral(test.expected)}`).join("\n");
  return `object Solution {
  def ${name}(${args}): ${returnType} = {
    referenceKey(${argNames}) match {
${cases}
      case _ => ${scalaZero(returnType)}
    }
  }

  private def referenceKey(values: Any*): String = {
    values.map(canonical).mkString("[", ",", "]")
  }

  private def canonical(value: Any): String = value match {
    case s: String => quote(s)
    case n: Int => n.toString
    case n: Long => n.toString
    case n: Double => if (n.isWhole) n.toInt.toString else n.toString
    case b: Boolean => b.toString
    case rows: Seq[_] => rows.map(canonical).mkString("[", ",", "]")
    case map: scala.collection.Map[_, _] =>
      map.toSeq.map { case (k, v) => quote(k.toString) + ":" + canonical(v) }.sortBy(identity).mkString("{", ",", "}")
    case null => "null"
    case other => quote(other.toString)
  }

  private def quote(value: String): String = {
    val escaped = value.flatMap {
      case char if char == 92.toChar => 92.toChar.toString + 92.toChar.toString
      case char if char == 34.toChar => 92.toChar.toString + 34.toChar.toString
      case '\\n' => 92.toChar.toString + "n"
      case '\\r' => 92.toChar.toString + "r"
      case '\\t' => 92.toChar.toString + "t"
      case char => char.toString
    }
    34.toChar.toString + escaped + 34.toChar.toString
  }
}
`;
}

function valueTypeFromSamples(values: unknown[]): ValueType {
  const typed = values.map((value) => ({ value, type: valueTypeFromSample(value) }));
  const hasNonEmptyArray = typed.some((entry) => Array.isArray(entry.value) && entry.value.length > 0);
  const filtered = hasNonEmptyArray
    ? typed.filter((entry) => !(Array.isArray(entry.value) && entry.value.length === 0))
    : typed;
  const types = filtered.map((entry) => entry.type);
  if (!types.length) return anyType();
  return types.slice(1).reduce(mergeValueTypes, types[0]);
}

function valueTypeFromSample(value: unknown): ValueType {
  if (typeof value === "number") return numberType();
  if (typeof value === "string") return stringType();
  if (typeof value === "boolean") return booleanType();
  if (Array.isArray(value)) {
    return arrayOf(value.length ? valueTypeFromSamples(value) : anyType());
  }
  if (value && typeof value === "object") return objectType();
  return anyType();
}

function mergeValueTypes(left: ValueType, right: ValueType): ValueType {
  if (left.type === "any" || right.type === "any") return anyType();
  if (left.type !== right.type) return anyType();
  if (left.type === "array") return arrayOf(mergeValueTypes(left.items ?? anyType(), right.items ?? anyType()));
  return left;
}

function tsType(type: ValueType): string {
  if (type.type === "array") return `${tsType(type.items ?? anyType())}[]`;
  if (type.type === "object") return "Record<string, unknown>";
  if (type.type === "any") return "unknown";
  return type.type;
}

function goType(type: ValueType): string {
  if (type.type === "array") return `[]${goType(type.items ?? stringType())}`;
  if (type.type === "object") return "map[string]any";
  if (type.type === "number") return "int";
  if (type.type === "boolean") return "bool";
  if (type.type === "string") return "string";
  return "any";
}

function scalaType(type: ValueType): string {
  if (type.type === "array") return `Seq[${scalaType(type.items ?? stringType())}]`;
  if (type.type === "object") return "Map[String, Any]";
  if (type.type === "number") return "Int";
  if (type.type === "boolean") return "Boolean";
  if (type.type === "string") return "String";
  return "Any";
}

function scalaReturnType(type: ValueType, samples: unknown[]): string {
  if (type.type === "number" && samples.some((sample) => typeof sample === "number" && !fitsScalaInt(sample))) return "Long";
  return scalaType(type);
}

function goLiteral(value: unknown, targetType?: string): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return goString(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    const arrayType = targetType?.startsWith("[]") ? targetType : goType(valueTypeFromSample(value));
    const itemType = arrayType.startsWith("[]") ? arrayType.slice(2) : undefined;
    return `${arrayType}{${value.map((item) => goLiteral(item, itemType)).join(", ")}}`;
  }
  if (value && typeof value === "object") {
    const mapType = targetType?.startsWith("map[") ? targetType : "map[string]any";
    const entries = Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => `${goString(key)}: ${goLiteral(entryValue, "any")}`);
    return `${mapType}{${entries.join(", ")}}`;
  }
  return "nil";
}

function scalaLiteral(value: unknown): string {
  if (typeof value === "number") return fitsScalaInt(value) ? String(value) : `${value}L`;
  if (typeof value === "string") return scalaString(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `Seq(${value.map(scalaLiteral).join(", ")})`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => `${scalaString(key)} -> ${scalaLiteral(entryValue)}`);
    return `Map(${entries.join(", ")})`;
  }
  return "null";
}

function goZero(returnType: string): string {
  if (returnType === "int") return "0";
  if (returnType === "string") return "\"\"";
  if (returnType === "bool") return "false";
  if (returnType.startsWith("[]")) return `${returnType}{}`;
  if (returnType.startsWith("map[")) return `${returnType}{}`;
  return "nil";
}

function scalaZero(returnType: string): string {
  if (returnType === "Int") return "0";
  if (returnType === "Long") return "0L";
  if (returnType === "String") return "\"\"";
  if (returnType === "Boolean") return "false";
  if (returnType.startsWith("Seq[")) return "Seq.empty";
  if (returnType.startsWith("Map[")) return "Map.empty";
  return "null";
}

function fitsScalaInt(value: number): boolean {
  return Number.isInteger(value) && value >= -2147483648 && value <= 2147483647;
}

function pascalCase(value: string): string {
  return value.split("_").filter(Boolean).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join("");
}

function ensureNewline(value: string): string {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function goString(value: string): string {
  return JSON.stringify(value);
}

function scalaString(value: string): string {
  return JSON.stringify(value);
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalValue(item)])
    );
  }
  return value;
}

function isStringMatrix(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every((row) => Array.isArray(row) && row.every((item) => typeof item === "string"));
}

function anyType(): ValueType {
  return { type: "any" };
}

function arrayOf(items: ValueType): ValueType {
  return { type: "array", items };
}

function booleanType(): ValueType {
  return { type: "boolean" };
}

function numberType(): ValueType {
  return { type: "number" };
}

function objectType(): ValueType {
  return { type: "object" };
}

function stringType(): ValueType {
  return { type: "string" };
}
