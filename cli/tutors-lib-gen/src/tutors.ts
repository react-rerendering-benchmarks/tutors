import { buildCourse } from "./lo/course-builder";
import { Lo } from "tutors-lib/src/lo/lo-types";
import { resourceBuilder } from "./lr/resource-builder";
import { writeFile } from "./utils/file-utils";
import { generateNetlifyToml } from "./utils/netlify";

export const version = "3.0.12";

export function parseCourse(folder: string): Lo {
  resourceBuilder.buildTree(folder);
  const course = buildCourse(resourceBuilder.lr);
  return course;
}

export function generateCourse(lo: Lo, folder: string) {
  resourceBuilder.copyAssets(folder);
  writeFile(folder, "tutors.json", JSON.stringify(lo));
  generateNetlifyToml(folder);
}
