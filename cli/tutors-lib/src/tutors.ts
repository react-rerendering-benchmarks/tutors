import { decorateCourseTree } from "./lo-tree";
import { Lo } from "./lo-types";

export const version = "3.0.12";

export function decorateCourse(lo: Lo) {
  decorateCourseTree(lo);
}
