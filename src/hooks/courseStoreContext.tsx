import { createContext, useContext, type ReactNode } from "react";
import { useCourseStore } from "./useCourseStore";

type CourseStore = ReturnType<typeof useCourseStore>;

const CourseStoreContext = createContext<CourseStore | null>(null);

export function CourseStoreProvider({ children }: { children: ReactNode }) {
  const store = useCourseStore();
  return <CourseStoreContext.Provider value={store}>{children}</CourseStoreContext.Provider>;
}

export function useStore() {
  const store = useContext(CourseStoreContext);
  if (!store) {
    throw new Error("useStore must be used within CourseStoreProvider");
  }
  return store;
}
