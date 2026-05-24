import type { ContentGraph, Problem, ProblemSet, Track } from "./types.js";

export class ContentCatalog {
  private readonly problemsById: Map<string, Problem>;
  private readonly setsById: Map<string, ProblemSet>;
  private readonly tracksById: Map<string, Track>;

  constructor(readonly graph: ContentGraph) {
    this.problemsById = new Map(graph.problems.map((problem) => [problem.id, problem]));
    this.setsById = new Map(graph.problemSets.map((set) => [set.id, set]));
    this.tracksById = new Map(graph.tracks.map((track) => [track.id, track]));
  }

  problem(id: string): Problem | undefined {
    return this.problemsById.get(id);
  }

  problemSet(id: string): ProblemSet | undefined {
    return this.setsById.get(id);
  }

  track(id: string): Track | undefined {
    return this.tracksById.get(id);
  }

  problemsForSet(id: string): Problem[] {
    const set = this.problemSet(id);
    if (!set) return [];
    return set.entries.map((entry) => this.problem(entry.problem)).filter((problem): problem is Problem => Boolean(problem));
  }
}
