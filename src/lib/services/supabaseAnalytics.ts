import { get } from "svelte/store";
import type { Course, Lo } from "$lib/services/models/lo-types";
import type { TokenResponse } from "$lib/services/types/auth";
import { currentCourse, currentLo, currentUser, onlineStatus } from "$lib/stores";
import { updateCalendar, readValue, supabaseService, supabaseUpdateStr, supabaseAddStudent, supabaseUpdateStudent, updateStudentCourseLoInteractionPageActive, updatePageActive, updatePageLoads, getStudents, updateLastAccess, updateStudentCourseLoInteractionPageLoads } from "$lib/services/utils/supabase";
import { presenceService } from "./presence";

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
    learningEvent(params: Record<string, string>, session: TokenResponse) {
        try {
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
            supabaseService.storeStudentCourseLearningObjectInSupabase(course, lo, session?.user);
            presenceService.sendLoEvent(course, lo, get(onlineStatus), session?.user);
            updatePageLoads("course_id", "course", course.courseId, 1);
            updateLastAccess("course_id", course.courseId, "course");
        } catch (error: any) {
            console.log(`TutorStore Error: ${error.message}`);
        }
    },

    updatePageCount(session: TokenResponse) {
        try {
            if (session?.user) {
                updateStudentCourseLoInteractionPageActive(course.courseId, session?.user.user_metadata.user_name, lo.route, 1);
                updatePageActive("id", "students", session.user.user_metadata.user_name, 1);
                updateLastAccess("id", session.user.user_metadata.user_name, "students");
                updatePageActive("course_id", "course", course.courseId, 1);
                updateLastAccess("course_id", course.courseId, "course");
                updateCalendar(course.calendar?.weeks, session.user.user_metadata.user_name);
            }
        } catch (error: any) {
            console.log(`TutorStore Error: ${error.message}`);
        }
    },

    async updateLogin(courseId: string, session: any) {
        try {
            const student = await getStudents(session.user.user_metadata.user_name);
            student ? supabaseUpdateStudent(session.user) : supabaseAddStudent(session.user);

        } catch (error: any) {
            console.log(`TutorStore Error: ${error.message}`);
        }
    }
};
