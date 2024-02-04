import { get } from "svelte/store";
import { updateLo } from "$lib/services/utils/all-course-access";
import type { Course, Lo } from "$lib/services/models/lo-types";
import type { TokenResponse } from "$lib/services/types/auth";
import { currentCourse, currentLo, currentUser, onlineStatus } from "$lib/stores";
import { updateCalendar, readValue, supabaseService, updateLastAccess, supabaseUpdateStr, supabaseAddStudent, supabaseSanitise, updatePageActive, updatePageLoads } from "$lib/services/utils/supabase";
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
      console.log("Supabase Inside learningEvent");
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
      console.log("Supabase Inside setOnlineStatus");
      const onlineStatus = status ? "online" : "offline";
      const key = session.user.id;
      supabaseUpdateStr(key, onlineStatus);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  async getOnlineStatus(course: Course, session: TokenResponse): Promise<string | undefined> {
    try {
      console.log("Supabase Inside getOnlineStatus");
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
      updateLastAccess("course_id", course.courseId, "course");
      updatePageLoads("course_id", "course", course.courseId, 1);
      supabaseService.storeLoEvent(course, lo, get(onlineStatus), session?.user);
      presenceService.sendLoEvent(course, lo, get(onlineStatus), session?.user);
      console.log("Supabase Inside reportPageLoad");
      if (session) {
        console.log("Supabase Inside session");
        supabaseService.storeCourseUsersLoToSupababse(course, lo, get(onlineStatus), session?.user);
        updatePageLoads("id", "students", session.user.user_metadata.user_name, 1);
        updateLastAccess("id", session.user.user_metadata.user_name, "students",);
      }
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  updatePageCount(session: TokenResponse) {
    try {
      if (!lo) return;
      console.log("Supabase Inside updatePageCount");
      updateLastAccess("id", this.loRoute, "learning-object");
      updatePageActive("course_id", "course", course.courseId, 1);

      if (session?.user) {
        supabaseService.storeLoEvent(course, lo, get(onlineStatus), session?.user);
        supabaseService.storeCourseUsersLoToSupababse(course, lo, get(onlineStatus), session?.user);
        updatePageActive("id", "students", session.user.user_metadata.user_name, 1);
        updateLastAccess("id", session.user.user_metadata.user_name, "students",);
      }
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
  },

  updateLogin(courseId: string, session: any) {
    try {
      console.log("Supabase Inside updateLogin", session);
      supabaseAddStudent(course, session.user);
    } catch (error: any) {
      console.log(`TutorStore Error: ${error.message}`);
    }
    // const key = `${courseId}/users/${sanitise(session.user.email)}`;
    // updateStr(`${key}/email`, session.user.email);
    // updateStr(`${key}/name`, session.user.user_metadata.full_name);
    // updateStr(`${key}/id`, session.user.id);
    // updateStr(`${key}/nickname`, session.user.user_metadata.preferred_username);
    // updateStr(`${key}/picture`, session.user.user_metadata.avatar_url);
    // updateStr(`${key}/last`, new Date().toString());
    // updateCountValue(`${key}/count`);
  }
};
