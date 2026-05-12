import { course, contentStats } from "../src/content/course";
import { validateCourse } from "../src/content/validate";

const errors = validateCourse(course);

if (errors.length) {
  console.error("Content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Content OK: ${contentStats.chapterCount} chapters, ${contentStats.lessonCount} lessons, ` +
    `${contentStats.guidedProblemCount} guided problems, ${contentStats.bonusProblemCount} bonus drills, ` +
    `${contentStats.quizCount} quizzes.`
);
