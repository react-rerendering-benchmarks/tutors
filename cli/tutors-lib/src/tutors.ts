import { decorateCourseTree } from "./lo/course-tree";
import { Lo } from "./lo/lo-types";

export const version = "3.0.12";

export function decorateCourse(lo: Lo) {
  decorateCourseTree(lo);
}
