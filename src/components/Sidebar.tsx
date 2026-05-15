import { BookOpen, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { course } from "../content/course";

export function Sidebar() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const lessons = course.lessons
      .filter((lesson) => `${lesson.title} ${lesson.concepts.join(" ")}`.toLowerCase().includes(normalized))
      .slice(0, 4)
      .map((lesson) => ({ id: lesson.id, title: lesson.title, to: `/lesson/${lesson.id}`, kind: "Lesson" }));
    const allProblems = [...course.problems, ...course.problemSets.flatMap((set) => set.problems)];
    const problems = allProblems
      .filter((problem) => `${problem.title} ${problem.patterns.join(" ")}`.toLowerCase().includes(normalized))
      .slice(0, 6)
      .map((problem) => ({ id: problem.id, title: problem.title, to: `/problem/${problem.id}`, kind: "Problem" }));
    return [...lessons, ...problems];
  }, [query]);

  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/" aria-label="Dashboard">
        <BookOpen size={24} />
        <span>DSA Coach</span>
      </NavLink>
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
      {course.problemSets.length ? (
        <>
          <p className="sidebar-eyebrow">Problem sets</p>
          <nav className="chapter-nav" aria-label="Problem sets">
            {course.problemSets.map((set) => (
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
    </aside>
  );
}
