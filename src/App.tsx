import { Navigate, Route, Routes } from "react-router-dom";
import { ChapterPage } from "./components/ChapterPage";
import { Dashboard } from "./components/Dashboard";
import { Layout } from "./components/Layout";
import { LessonPage } from "./components/LessonPage";
import { ProblemPage } from "./components/ProblemPage";
import { QuizPage } from "./components/QuizPage";
import { CourseStoreProvider, useStore } from "./hooks/courseStoreContext";

export function App() {
  return (
    <CourseStoreProvider>
      <ReadyGate />
    </CourseStoreProvider>
  );
}

function ReadyGate() {
  const { ready } = useStore();
  if (!ready) return <div className="loading-screen">Loading local course...</div>;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="chapter/:chapterId" element={<ChapterPage />} />
        <Route path="lesson/:lessonId" element={<LessonPage />} />
        <Route path="problem/:problemId" element={<ProblemPage />} />
        <Route path="quiz/:quizId" element={<QuizPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
