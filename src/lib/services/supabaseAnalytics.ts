import { get } from "svelte/store";
import type { Course, Lo } from "$lib/services/models/lo-types";
import type { TokenResponse } from "$lib/services/types/auth";
import { currentCourse, currentLo, currentUser, onlineStatus } from "$lib/stores";
import { getUsers, updateCalendar, readValue, supabaseService, supabaseUpdateStr, supabaseAddStudent, supabaseSanitise, supabaseUpdateStudent, updateStudentCourseLoInteractionPageActive, updateStudentPageLoads, updateStudentPageActive, updateStudentLastAccess} from "$lib/services/utils/supabase";
import { presenceService } from "./presence";
import { PUBLIC_SUPABASE_URL } from "$env/static/public";

let course: Course;
let user: TokenResponse;
let lo: Lo;

currentCourse.subscribe((current) => {
  course = current;
});
currentUser.subscribe((current) => {
  user = current;
});
currentLo.subscribe((current) => {
  lo = current;
});

export const analyticsService = {
  loRoute: "",

  learningEvent(params: Record<string, string>, session: TokenResponse) {
    try {
      if (params.loid) {
        this.loRoute = supabaseSanitise(params.loid);
      }
      this.reportPageLoad(session);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  setOnlineStatus(status: boolean, session: TokenResponse) {
    try {
      const onlineStatus = status ? "online" : "offline";
      const key = session.user.id;
      supabaseUpdateStr(key, onlineStatus);
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

  reportPageLoad(session: TokenResponse) {
    try {
      if (!lo || PUBLIC_SUPABASE_URL === "XXX") return;
      updateStudentLastAccess("course_id", course.courseId, "course");
      updateStudentPageLoads("course_id", "course", course.courseId, 1);
      supabaseService.storeLoEvent(course, lo, get(onlineStatus), session?.user);
      presenceService.sendLoEvent(course, lo, get(onlineStatus), session?.user);
      if (session) {
        supabaseService.storeCourseUsersLoToSupababse(course, lo, get(onlineStatus), session?.user);
        updateStudentPageLoads("id", "students", session.user.user_metadata.user_name, 1);
        updateStudentLastAccess("id", session.user.user_metadata.user_name, "students",);
      }
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  updatePageCount(session: TokenResponse) {
    try {
      if (!lo) return;
      updateStudentCourseLoInteractionPageActive(course.courseId, session?.user.user_metadata.user_name,lo.route, 1);
      updateStudentPageActive("course_id", "course", course.courseId, 1);
      if (session?.user) {
        supabaseService.storeLoEvent(course, lo, get(onlineStatus), session?.user);
        updateStudentPageLoads("id", "students", session.user.user_metadata.user_name, 1);
        updateStudentLastAccess("id", session.user.user_metadata.user_name, "students",);
        updateCalendar(course.calendar?.weeks, session.user.user_metadata.user_name);
      }
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  async updateLogin(courseId: string, session: any) {
    try {
      const student = await getUsers(session.user.user_metadata.user_name);
      student ? supabaseUpdateStudent(session.user) : supabaseAddStudent(session.user);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  }
};
