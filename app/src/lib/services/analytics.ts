import { get } from "svelte/store";
import { updateLo } from "$lib/services/utils/all-course-access";
import type { Course, Lo } from "$lib/services/models/lo-types";
import type { TokenResponse } from "$lib/services/types/auth";
import { currentCourse, currentLo, currentUser, onlineStatus } from "$lib/stores";
import { SupabaseClient } from "@supabase/supabase-js";
import { readValue, sanitise, updateCalendar, updateCount, updateCountValue, updateLastAccess, updateStr, updateVisits, readValueSupabase, updateVisitsSupabase, updateLastAccessSupabase,} from "$lib/services/utils/firebase";

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
    if (params.loid) {
      this.loRoute = sanitise(params.loid);
    }
    this.reportPageLoad(session);
  },

  setOnlineStatus(status: boolean, session: TokenResponse) {
    const onlineStatus = status ? "online" : "offline";
    const key = `${course.courseId}/users/${sanitise(session.user.email)}/onlineStatus`;
    updateStr(key, onlineStatus);
  },

  async getOnlineStatus(course: Course, session: TokenResponse): Promise<string> {
    if (!course || !user) {
      return "online";
    }
    const courseId = course.courseUrl.substring(0, course.courseUrl.indexOf("."));
    const key = `${courseId}/users/${sanitise(session.user.email)}/onlineStatus`;
    const status = await readValue(key);
    return status || "online";
  },

  reportPageLoad(session: TokenResponse) {
    if (!lo) return;
    updateLastAccess(`${course.courseId}/usage/${this.loRoute}`, course.title);
    updateVisits(course.courseUrl.substring(0, course.courseUrl.indexOf(".")));

    updateLastAccess(`all-course-access/${course.courseId}`, course.title);
    updateVisits(`all-course-access/${course.courseId}`);
    updateLo(`all-course-access/${course.courseId}`, course, lo, get(onlineStatus), session?.user);

    if (session) {
      const key = `${course.courseUrl.substring(0, course.courseUrl.indexOf("."))}/users/${sanitise(session.user.email)}/${this.loRoute}`;
      updateLastAccess(key, lo.title);
      updateVisits(key);
    }
  },

  updatePageCount(session: TokenResponse) {
    if (!lo) return;
    updateLastAccess(`${course.courseId}/usage/${this.loRoute}`, course.title);
    updateCount(course.courseId);
    if (session?.user) {
      updateCount(`all-course-access/${course.courseId}`);
      updateLo(`all-course-access/${course.courseId}`, course, lo, get(onlineStatus), session?.user);
      const key = `${course.courseId}/users/${sanitise(session.user.email)}/${this.loRoute}`;
      updateLastAccess(key, lo.title);
      updateCount(key);
      updateCalendar(`${course.courseId}/users/${sanitise(session.user.email)}`);
    }
  },

  updateLogin(courseId: string, session: any) {
    const key = `${courseId}/users/${sanitise(session.user.email)}`;
    updateStr(`${key}/email`, session.user.email);
    updateStr(`${key}/name`, session.user.user_metadata.full_name);
    updateStr(`${key}/id`, session.user.id);
    updateStr(`${key}/nickname`, session.user.user_metadata.preferred_username);
    updateStr(`${key}/picture`, session.user.user_metadata.avatar_url);
    updateStr(`${key}/last`, new Date().toString());
    updateCountValue(`${key}/count`);
  },
  /**
   * Supabase Analytics
   */

  learningEventSupabase(params: Record<string, string>, session: TokenResponse) {
    if (params.loid) {
      this.loRoute = sanitise(params.loid);
    }
    this.reportPageLoadSupabase(session);
  },

  setOnlineStatusSupabase(status: boolean, session: TokenResponse) {
    const onlineStatus = status ? "online" : "offline";
    const key = `${course.courseId}/users/${sanitise(session.user.email)}/onlineStatus`;
    updateStr(key, onlineStatus);
  },

  async getOnlineStatusSupabase(course: Course, session: TokenResponse, supabase: SupabaseClient): Promise<string> {
    if (!course || !session.user) {
      console.log("online")
      return "online";
    }
    const courseId = course.courseUrl.substring(0, course.courseUrl.indexOf("."));
    const key = `${course.title}/user/${sanitise(session.user.email)}`;
    const status = await readValueSupabase(course.title,supabase);
    console.log("status of", status || "online");
    return status || "online";
  },

  reportPageLoadSupabase(session: TokenResponse) {
    if (!lo) return;
    updateLastAccessSupabase(`${course.courseId}/usage/${this.loRoute}`, course.title);
    updateVisitsSupabase(course.courseUrl.substring(0, course.courseUrl.indexOf(".")));

    updateLastAccessSupabase(`all-course-access/${course.courseId}`, course.title);
    updateVisitsSupabase(`all-course-access/${course.courseId}`);
    updateLo(`all-course-access/${course.courseId}`, course, lo, get(onlineStatus), session?.user);

    if (session) {
      const key = `${course.courseUrl.substring(0, course.courseUrl.indexOf("."))}/users/${sanitise(session.user.email)}/${this.loRoute}`;
      updateLastAccessSupabase(key, lo.title);
      updateVisitsSupabase(key);
    }
  },

  updatePageCountSupabase(session: TokenResponse) {
    if (!lo) return;
    updateLastAccess(`${course.courseId}/usage/${this.loRoute}`, course.title);
    updateCount(course.courseId);
    if (session?.user) {
      updateCount(`all-course-access/${course.courseId}`);
      updateLo(`all-course-access/${course.courseId}`, course, lo, get(onlineStatus), session?.user);
      const key = `${course.courseId}/users/${sanitise(session.user.email)}/${this.loRoute}`;
      updateLastAccess(key, lo.title);
      updateCount(key);
      updateCalendar(`${course.courseId}/users/${sanitise(session.user.email)}`);
    }
  },

  // updateLogin(courseId: string, session: any) {
  //   const key = `${courseId}/users/${sanitise(session.user.email)}`;
  //   updateStr(`${key}/email`, session.user.email);
  //   updateStr(`${key}/name`, session.user.user_metadata.full_name);
  //   updateStr(`${key}/id`, session.user.id);
  //   updateStr(`${key}/nickname`, session.user.user_metadata.preferred_username);
  //   updateStr(`${key}/picture`, session.user.user_metadata.avatar_url);
  //   updateStr(`${key}/last`, new Date().toString());
  //   updateCountValue(`${key}/count`);
  // }
};
