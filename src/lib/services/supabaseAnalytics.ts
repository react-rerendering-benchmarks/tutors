import { get } from "svelte/store";
import type { Course, Lo } from "$lib/services/models/lo-types";
import type { TokenResponse } from "$lib/services/types/auth";
import { currentCourse, currentLo, currentUser, onlineStatus } from "$lib/stores";
import { readValue, updateStudentsStatus, updateLastAccess, storeStudentCourseLearningObjectInSupabase, updateStudentCourseLoInteractionDuration, updateDuration, updateCalendarDuration, addOrUpdateStudent } from "$lib/services/utils/supabase";
import { presenceService } from "./presence";
import { formatDate } from "./utils/metrics";

let course: Course;
let user: TokenResponse;
let lo: Lo;
let loid: string;

currentCourse.subscribe((current) => {
  course = current;
});
currentUser.subscribe((current) => {
  user = current;
});
currentLo.subscribe((current) => {
  lo = current;
});

export const supabaseAnalyticsService = {
  learningEvent(params: any, session: TokenResponse) {
    try {
      loid = params?.params?.loid;
      this.reportPageLoad(params, session);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  setOnlineStatus(status: boolean, session: TokenResponse) {
    try {
      const onlineStatus = status ? "online" : "offline";
      updateStudentsStatus(session.user.user_metadata.user_name, onlineStatus);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  async getOnlineStatus(course: Course, session: TokenResponse): Promise<string | undefined> {
    try {
      if (!course || !user) {
        return "online";
      }
      const key = session.user.id;
      const status = await readValue(key);
      return status || "online";
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  reportPageLoad(params: any, session: TokenResponse) {
    try {
      storeStudentCourseLearningObjectInSupabase(course, params.data, params?.params?.loid, lo, session?.user);
      presenceService.sendLoEvent(course, lo, get(onlineStatus), session?.user);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  async updatePageCount(session: TokenResponse) {
    try {
      if (session?.user) {
        if (loid) updateStudentCourseLoInteractionDuration(course.courseId, session?.user.user_metadata.user_name, loid);
        updateDuration("id", "students", session.user.user_metadata.user_name);
        updateLastAccess("id", session.user.user_metadata.user_name, "students");
        updateDuration("course_id", "course", course.courseId);
        updateLastAccess("course_id", course.courseId, "course");
        updateCalendarDuration(formatDate(new Date()), session.user.user_metadata.user_name, course.courseId);
      }
    } catch (error: any) {
      console.error(`TutorStore Error: ${error.message}`);
    }
  },

  async updateLogin(session: any) {
    try {
      await addOrUpdateStudent(session.user);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  }
};
