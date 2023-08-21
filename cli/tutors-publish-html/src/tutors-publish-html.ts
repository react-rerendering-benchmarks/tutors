#!/usr/bin/env node
import * as fs from "fs";
import { parseCourse, generateCourse, version } from "tutors-lib-gen/src/tutors";
import { decorateCourse } from "tutors-lib/src/tutors";
import { emitCourse } from "./course-emitter";

const versionStr = `tutors-publish-html: ${version}`;
console.log(versionStr);

if (!fs.existsSync("course.md")) {
  console.log("Cannot locate course.md. Change to course folder and try again. ");
} else {
  const srcFolder = process.cwd();
  const destFolder = `${srcFolder}/html`;
  const lo = parseCourse(srcFolder);
  generateCourse(lo, destFolder);
  decorateCourse(lo);
  emitCourse(destFolder, lo);
}
console.log(versionStr);
