import { get } from "svelte/store";
import type { Course, Lo } from "$lib/services/models/lo-types";
import type { TokenResponse } from "$lib/services/types/auth";
import { currentCourse, currentLo, currentUser, onlineStatus } from "$lib/stores";
import { readValue, updateStudentsStatus, supabaseAddStudent, supabaseUpdateStudent, getStudents, updateLastAccess, storeStudentCourseLearningObjectInSupabase, updateStudentCourseLoInteractionDuration, updateDuration } from "$lib/services/utils/supabase";
import { presenceService } from "./presence";
import { formatDate } from "./utils/metrics";

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

    reportPageLoad(session: TokenResponse) {
        try {
            storeStudentCourseLearningObjectInSupabase(course, lo, session?.user);
            presenceService.sendLoEvent(course, lo, get(onlineStatus), session?.user);
        } catch (error: any) {
            console.log(`TutorStore Error: ${error.message}`);
        }
    },

    updatePageCount(session: TokenResponse) {
        try {
            if (session?.user) {
                updateStudentCourseLoInteractionDuration(course.courseId, session?.user.user_metadata.user_name, lo.route, 1);
                updateDuration("id", "students", session.user.user_metadata.user_name, 1);
                updateLastAccess("id", session.user.user_metadata.user_name, "students");
                updateDuration("course_id", "course", course.courseId, 1);
                updateLastAccess("course_id", course.courseId, "course");
                updateDuration("id", "calendar", formatDate(new Date()), 1);
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
