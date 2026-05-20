import type { ProblemSet } from "../../types";
import {
  LIBRARY_ORDEREDDICT_SET_ID,
  LIBRARY_SET_IDS,
  LIBRARY_SORTEDCONTAINERS_SET_ID
} from "./_shared";
import { orderedDictProblems } from "./orderedDict";
import { sortedContainersProblems } from "./sortedContainers";

export {
  LIBRARY_ORDEREDDICT_SET_ID,
  LIBRARY_SET_IDS,
  LIBRARY_SORTEDCONTAINERS_SET_ID
} from "./_shared";

const sortedContainersSet: ProblemSet = {
  id: LIBRARY_SORTEDCONTAINERS_SET_ID,
  title: "sortedcontainers · SortedList",
  summary:
    "Order-statistic problems that are awkward without a sorted container — O(log n) add/remove with O(1) indexed access.",
  intro:
    "`sortedcontainers.SortedList` is the cleanest answer to 'I need a collection that stays sorted as I add and remove from it, AND lets me index into the middle.' These problems push you toward that idiom: a running median over a stream and a sliding median over a window. Both are solvable with two heaps or `bisect.insort`, but SortedList collapses the bookkeeping into one object and one O(log n) primitive.",
  problems: sortedContainersProblems
};

const orderedDictSet: ProblemSet = {
  id: LIBRARY_ORDEREDDICT_SET_ID,
  title: "collections · OrderedDict",
  summary:
    "Cache and stream problems that lean on insertion-order semantics plus move-to-end and pop-oldest.",
  intro:
    "Python 3.7+ regular dicts preserve insertion order, but `collections.OrderedDict` adds the two methods you can't easily fake: `move_to_end(key)` to update recency in O(1) and `popitem(last=False)` to evict the oldest entry in O(1). These problems exercise both — a classic LRU cache and a streaming 'first unique token' problem where the front of the OrderedDict is always the answer.",
  problems: orderedDictProblems
};

export const librarySets: ProblemSet[] = [sortedContainersSet, orderedDictSet];
