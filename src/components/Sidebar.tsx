import { BookOpen, Library, PanelLeftClose, PanelLeftOpen, Search, Sparkles, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { course } from "../content/course";
import { ASSESSMENT_SET_ID, assessments } from "../content/assessments";
import { LIBRARY_SET_IDS } from "../content/libraries";
import { useStore } from "../hooks/courseStoreContext";

export function Sidebar() {
  const [query, setQuery] = useState("");
  const { settings, saveSetting } = useStore();
  const location = useLocation();
  const onProblem = location.pathname.startsWith("/problem/");
  const collapsed = settings["workspace:sidebarCollapsed"]?.value === true;
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const lessons = course.lessons
      .filter((lesson) => `${lesson.title} ${lesson.concepts.join(" ")}`.toLowerCase().includes(normalized))
      .slice(0, 4)
      .map((lesson) => ({ id: lesson.id, title: lesson.title, to: `/lesson/${lesson.id}`, kind: "Lesson" }));
    // Exclude assessment-set problems from search results — they belong to
    // the dedicated /assessment route, not /problem. Library-section
    // problems use the regular /problem route, so they remain searchable.
    const allProblems = [
      ...course.problems,
      ...course.problemSets.flatMap((set) => (set.id === ASSESSMENT_SET_ID ? [] : set.problems))
    ];
    const problems = allProblems
      .filter((problem) => `${problem.title} ${problem.patterns.join(" ")}`.toLowerCase().includes(normalized))
      .slice(0, 6)
      .map((problem) => ({ id: problem.id, title: problem.title, to: `/problem/${problem.id}`, kind: "Problem" }));
    const assessmentHits = assessments
      .filter((a) => `${a.title} ${a.archetype}`.toLowerCase().includes(normalized))
      .slice(0, 3)
      .map((a) => ({ id: a.id, title: a.title, to: `/assessment/${a.id}`, kind: "Assessment" }));
    return [...lessons, ...problems, ...assessmentHits];
  }, [query]);

  const librarySetIds = new Set<string>(LIBRARY_SET_IDS);
  const visibleProblemSets = course.problemSets.filter(
    (set) => set.id !== ASSESSMENT_SET_ID && !librarySetIds.has(set.id)
  );
  const librarySets = course.problemSets.filter((set) => librarySetIds.has(set.id));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand-row">
        <NavLink className="brand" to="/" aria-label="Dashboard">
          <BookOpen size={24} />
          <span>DSA Coach</span>
        </NavLink>
        {onProblem ? (
          <button
            type="button"
            className="sidebar-collapse-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => void saveSetting("workspace:sidebarCollapsed", !collapsed)}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        ) : null}
      </div>
      <label className="search-box">
        <Search size={16} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
      </label>
      {results.length ? (
        <div className="search-results">
          {results.map((result) => (
            <NavLink key={`${result.kind}-${result.id}`} to={result.to}>
              <span>{result.kind}</span>
              {result.title}
            </NavLink>
          ))}
        </div>
      ) : null}
      {assessments.length ? (
        <>
          <p className="sidebar-eyebrow">Assessments</p>
          <nav className="chapter-nav" aria-label="Assessments">
            <NavLink to="/assessments">
              <span aria-hidden="true"><Timer size={14} /></span>
              CodeSignal ICF Practice
            </NavLink>
          </nav>
        </>
      ) : null}
      {visibleProblemSets.length ? (
        <>
          <p className="sidebar-eyebrow">Problem sets</p>
          <nav className="chapter-nav" aria-label="Problem sets">
            {visibleProblemSets.map((set) => (
              <NavLink key={set.id} to={`/set/${set.id}`}>
                <span aria-hidden="true"><Sparkles size={14} /></span>
                {set.title}
              </NavLink>
            ))}
          </nav>
        </>
      ) : null}
      <p className="sidebar-eyebrow">Modules</p>
      <nav className="chapter-nav" aria-label="Modules">
        {course.chapters.map((chapter) => (
          <NavLink key={chapter.id} to={`/chapter/${chapter.id}`}>
            <span>{chapter.order.toString().padStart(2, "0")}</span>
            {chapter.title}
          </NavLink>
        ))}
      </nav>
      {librarySets.length ? (
        <>
          <p className="sidebar-eyebrow">Libraries</p>
          <nav className="chapter-nav" aria-label="Libraries">
            {librarySets.map((set) => (
              <NavLink key={set.id} to={`/set/${set.id}`}>
                <span aria-hidden="true"><Library size={14} /></span>
                {set.title}
              </NavLink>
            ))}
          </nav>
        </>
      ) : null}
    </aside>
  );
}
