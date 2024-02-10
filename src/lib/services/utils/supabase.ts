import type { Course, Lo } from "../models/lo-types";
import { writable, type Writable } from "svelte/store";
import type { SupabaseCourse, SupabaseLearningObject, SupabaseStudent, ResponseData, SemesterData } from "$lib/services/types/supabase";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { db } from "$lib/db/client";
import { currentSupabaseCourse, supabaseCourses, supabaseLearningObjects, supabaseStudents } from "$lib/stores";
import type { User } from "@supabase/supabase-js";
import type { LoEvent, LoUser } from "../types/presence";
import { page } from "$app/stores";
// const supabase_channel = db
//   .channel('table_db_changes')
//   .on
//   (
//     'postgres_changes',
//     {
//       event: '*', // 'INSERT, UPDATE, DELETE'
//       schema: 'public',
//       table: 'course'
//     },
//     (payload) => currentSupabaseCourse.set(payload.new)
//   ).on(
//     'postgres_changes',
//     {
//       event: '*',
//       schema: 'public',
//       table: 'students',
//     },
//     (payload) => supabaseStudents.set(payload.)
//   ).on(
//     'postgres_changes',
//     {
//       event: '*',
//       schema: 'public',
//       table: 'course-lo',
//     },
//     (payload) => supabaseLearningObjects.set(payload.new)
//   )
//   .subscribe()

export async function supabaseUpdateStr(key: string, str: string) {
    try {
        const { data, error } = await db
            .from('students')
            .update({
                online_status: str,
            }).eq('id', key);
    } catch (error: any) {
        console.log(`TutorStore Error: ${error.message}`);
    }
};

export async function readValue(key: string): Promise<any> {
    try {
        const { data, error } = await db.from('students').select().eq('id', key);
        return data;

    } catch (error: any) {
        console.log(`TutorStore Error: ${error.message}`);
    }
};

async function getCalendarData(id: string): Promise<any> {
    try {
        const { data, error } = await db.from('calendar').select().eq('student_id', id);
        return data;

    } catch (error: any) {
        console.log(`TutorStore Error: ${error.message}`);
    }
}

export async function updateCalendar(weeks: any, id: string) {
    try {

        const returnedData = await getCalendarData(id)
        if (returnedData === undefined || returnedData.length === 0) {

            const pageActivePromise = getActivePageTotal("student_id", "calendar", id, 1);
            const pageLoadsPromise = getActiveLoadsTotal("student_id", "calendar", id, 1);

            // Await the promises here
            const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);

            const { data, error } = await db
                .from('calendar')
                .insert({
                    id: new Date(),
                    student_id: id,
                    page_active: pageActive,
                    page_loads: pageLoads,
                    date_last_accessed: new Date().getTime(),
                });
        } else {
            const pageActivePromise = getActivePageTotal("student_id", "calendar", id, 1);
            const pageLoadsPromise = getActiveLoadsTotal("student_id", "calendar", id, 1);
            const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
            await db
                .from('calendar')
                .update({
                    page_active: pageActive,
                    date_last_accessed: new Date().toISOString(),
                    page_loads: pageLoads,
                })
                .eq('student_id', id);
        }

        // Handle the response as needed
    } catch (error: any) {
        console.log(`TutorStore Error: ${error.message}`);
    }
}

/********************************************
 * *********** Course Functions *************
 */
export const loadCourses = async () => {
    try {
        const { data, error } = await db.from('course').select();
        if (error) {
            throw error;
        }
        supabaseCourses.set(data);
    } catch (error) {
        console.log('Error loading courses:', error);
    }
};

export async function addCourse(course: Course){
    try {
        // Validate input data
        if (!course) {
            throw new Error('Invalid input data. courseId and title must be provided.');
        }
        const pageActivePromise = getActivePageTotal("course_id", "course", course.courseId, 1);
        const pageLoadsPromise = getActiveLoadsTotal("course_id", "course", course.courseId, 1);
        const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);

        // Insert the course
        const { data, error } = await db
            .from('course')
            .insert({
                course_id: course.courseId,
                title: course.title,
                page_active: pageActive,
                page_loads: pageLoads,
                date_last_accessed: new Date().toISOString(),
                img: course.img,
            });

        // Handle insertion result
        if (data) {
            supabaseCourses.update(cur => [...cur, data[0]]);
        }
    } catch (error) {
        console.log('Error adding course:', error);
    }
};

export async function updateCourse(course: Course){
    try {
        // Validate input data
        if (!course) {
            throw new Error('Invalid input data. courseId must be provided.');
        }

        const pageActivePromise = getActivePageTotal("course_id", "course", course.courseId, 1);
        const pageLoadsPromise = getActiveLoadsTotal("course_id", "course", course.courseId, 1);
        const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
        // Update the course
        await db
            .from('course')
            .update({
                page_active: pageActive,
                page_loads: pageLoads,
                date_last_accessed: new Date().toISOString(),
                img: course.img,
            })
            .eq('course_id', course.courseId);
    } catch (error) {
        console.error('Error updating course:', error);
    }
};

export async function getUserCourses(courseId: string, studentId: string, loId: string): Promise<any> {
    if (!courseId || !studentId || !loId) {
        console.error("Missing required parameters: courseId and studentId must be provided.");
        return null; // Or you can return a custom error object
    }
    try {
        const { data, error } = await db
            .from('student-course-interaction')
            .select()
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .eq('lo_id', loId);

        if (error) {
            console.log("Error fetching user courses:", error.details);
            return null;
        }

        return data;
    } catch (error) {
        console.log("Error fetching user courses:", error.message);
        return null;
    }
};

export async function getCourses(courseId: string): Promise<any> {
    if (!courseId) return;
    const { data, error } = await db.from('course').select().eq('course_id', courseId);
    if (error) {
        return console.log(error);
    }
    return data;
};

/*********************************************
 * *********** Student Functions *************
 */

export async function getUsers(studentId: string): Promise<any> {
    if (!studentId) return;
    try {
        const { data } = await db.from('students').select().eq('id', studentId);
        return data;
    } catch (error) {
        console.error('Error fetching student:', error);
    }
};

export async function supabaseAddStudent(userDetails: User) {
    try {
        const pageActivePromise = getActivePageTotal("id", "students", userDetails.user_metadata.user_name, 1);
        const pageLoadsPromise = getActiveLoadsTotal("id", "students", userDetails.user_metadata.user_name, 1);
        const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
        const { data, error: insertError } = await db
            .from('students')
            .insert({
                id: userDetails.user_metadata.user_name,
                avatar: userDetails.user_metadata.avatar_url,
                full_name: userDetails.user_metadata.full_name,
                email: userDetails.user_metadata.email || "",
                page_active: pageActive,
                date_last_accessed: new Date().toISOString(),
                page_loads: pageLoads,
            });

        if (data) {
            supabaseStudents.update(cur => [...cur, data[0]]);
        }
    } catch (error) {
        console.error('Error adding Student:', error);
    }
}

export async function supabaseUpdateStudent(userDetails: User) {
    try {
        const pageActivePromise = getActivePageTotal("id", "students", userDetails.user_metadata.user_name, 1);
        const pageLoadsPromise = getActiveLoadsTotal("id", "students", userDetails.user_metadata.user_name, 1);
        const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
        const { data, error: updateError } = await db
            .from('students')
            .update({
                avatar: userDetails.user_metadata.avatar_url,
                full_name: userDetails.user_metadata.full_name,
                email: userDetails.user_metadata.email || "",
                page_active: pageActive,
                date_last_accessed: new Date().toISOString(),
                page_loads: pageLoads,
            })
            .eq('id', userDetails.user_metadata.user_name);

        if (data) supabaseStudents.update(cur => [...cur, data[0]]);
    } catch (error) {
        console.error('Error updating Student', error);
    }
}

/*********************************************
 * *********** Learning Object Functions *************
 */

export async function insertStudentCourseLoTable(courseId: string, studentId: string, loId: string): Promise<any> {
    try {
        const pageActivePromise = getNumOfStudentCourseLoPageActive(courseId, studentId, loId, 1);
        const pageLoadsPromise = getNumOfStudentCourseLoPageLoads(courseId, studentId, loId, 1);
        const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
        await db
            .from('student-course-interaction')
            .insert({
                course_id: courseId,
                student_id: studentId,
                lo_id: loId,
                page_active: pageActive,
                date_last_accessed: new Date().toISOString(),
                page_loads: pageLoads
            });
    } catch (error) {
        console.error(error);
    }
};

export async function updateStudentCourseLoTable(courseId: string, studentId: string, loId: string): Promise<any> {
    try {
        const pageActivePromise = getNumOfStudentCourseLoPageActive(courseId, studentId, loId, 1);
        const pageLoadsPromise = getNumOfStudentCourseLoPageLoads(courseId, studentId, loId, 1);
        const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
        await db
            .from('student-course-interaction')
            .update({
                page_active: pageActive,
                date_last_accessed: new Date().toISOString(),
                page_loads: pageLoads,
            })
            .eq('lo_id', loId)
            .eq('student_id', studentId)
            .eq('course_id', courseId);
    } catch (error) {
        console.error(error);
    }
}

export const updateLastAccess = async (key: string, id: string, table: any): Promise<any> => {
    try {
        const { error: updateError } = await db
            .from(table)
            .update({ date_last_accessed: new Date().toISOString() })
            .eq(key, id);

        if (updateError) {
            throw updateError;
        }
    }
    catch (error) {
        console.error('UpdateLastAccess error: ' + error);
    }
};

export const updateStudentLastAccess = async (key: string, id: string, table: any): Promise<any> => {
    try {
        const { error: updateError } = await db
            .from(table)
            .update({ date_last_accessed: new Date().toISOString() })
            .eq(key, id);

        if (updateError) {
            throw updateError;
        }
    }
    catch (error) {
        console.error('UpdateLastAccess error: ' + error);
    }
};

export async function addLo(currentLo: Lo) {
    try {
        // Insert the learning object
        const { error } = await db
            .from('learning-object')
            .insert({
                id: currentLo.route,
                type: currentLo.type,
                name: currentLo.title,
                date_last_accessed: new Date().toISOString(),
                parent: currentLo.parentLo ? currentLo.parentLo.route : null,
                lo_img: currentLo.img
            });
    } catch (error) {
        console.error('Error adding learning object:', error);
    }
};


export async function updateLo(currentLo: Lo) {
    try {
        // Validate input data
        if (!currentLo) {
            throw new Error('Invalid input data. Both course and currentLo must be provided.');
        }

        // Update the learning object
        await db
            .from('learning-object')
            .update({
                date_last_accessed: new Date().toISOString(),
            })
            .eq('id', currentLo.route);

    } catch (error) {
        console.error('Error updating learning object:', error);
    }
};

/**********Student-course-lo-inetraction table active and loads */

export const updateStudentCourseLoInteractionPageActive = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from('student-course-interaction')
            .select('page_active')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId)
            .single();

        let currentCount: number = 0;
        currentCount = data?.page_active || 0;
        const newCount = currentCount + incrementBy;

        await db
            .from('student-course-interaction')
            .update({ 'page_active': newCount })
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId);

    } catch (error: any) {
        console.error(`Error updating how long the page is active for student-course-interaction: ${error.message}`);
    }
};

export const updateStudentCourseLoInteractionPageLoads = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from('student-course-interaction')
            .select('page_loads')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId)
            .single();

        let currentCount: number = 0;
        currentCount = data?.page_loads || 0;
        const newCount = currentCount + incrementBy;

        await db
            .from('student-course-interaction')
            .update({ 'page_loads': newCount })
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId);

    } catch (error: any) {
        console.error(`Error updating how long the page is active for student-course-interaction: ${error.message}`);
    }
};

export const getNumOfStudentCourseLoPageActive = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from('student-course-interaction')
            .select('page_active')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId)
            .single();

        if (data === null) {
            console.warn('No data returned from Supabase.');
        }

        let currentCount: number = 0;
        currentCount = data?.page_active || 0;
        const newCount = currentCount + incrementBy;
        return newCount;

    } catch (error: any) {
        console.error(`Error updating how long the page is active for student-course-interaction: ${error.message}`);
    }
};

export const getNumOfStudentCourseLoPageLoads = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from('student-course-interaction')
            .select('page_loads')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId)
            .single();

        let currentCount: number = 0;
        currentCount = data?.page_loads || 0;
        const newCount = currentCount + incrementBy;
        return newCount;

    } catch (error: any) {
        console.error(`Error updating how long the page is active for student-course-interaction: ${error.message}`);
    }
};

export const getActivePageTotal = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_active')
            .eq(key, id)
            .single();

        let currentCount: number = 0;
        currentCount = data?.page_active || 0;
        const newCount = currentCount + incrementBy;

        return newCount;
    } catch (error: any) {
        console.error(`Error updating how long the page is active for ${table}: ${error.message}`);
    }
};

export const getActiveLoadsTotal = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_loads')
            .eq(key, id)
            .single();

        let currentCount: number = 0;
        currentCount = data?.page_loads || 0;
        const newCount = currentCount + incrementBy;
        return newCount;

    } catch (error: any) {
        console.error(`Error updating count for table ${table}: ${error.message}`);
    }
};

export const updateStudentPageLoads = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_loads')
            .eq(key, id)
            .single();

        let currentCount: number = 0;
        currentCount = data?.page_loads || 0;
        const newCount = currentCount + incrementBy;

        await db
            .from(table)
            .update({ 'page_loads': newCount })
            .eq(key, id);

    } catch (error: any) {
        console.error(`Error updating count for table ${table}: ${error.message}`);
    }
};

export const updateStudentPageActive = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_active')
            .eq(key, id)
            .single();

        let currentCount: number = 0;

        currentCount = data?.page_active || 0;
        const newCount = currentCount + incrementBy;

        await db
            .from(table)
            .update({ 'page_active': newCount })
            .eq(key, id);

    } catch (error: any) {
        console.error(`Error updating count for table ${table}: ${error.message}`);
    }
};

export const supabaseService = {
    async insertOrUpdateLoEvent(currentLo: Lo) {
        try {
            const { data, error } = await db.from('learning-object').select().eq('id', currentLo.route);
            if (data === null || data.length === 0) {
                await addLo(currentLo);
            } else {
                await updateLo(currentLo);
            }
        } catch (error) {
            console.error("insertOrUpdateLoEvent: ", error);
        }
    },

    async insertOrUpdateStudent(userDetails: User) {
        try {
            if (userDetails.user_metadata.full_name === "Anon") return;
            const returnedStudent = await getUsers(userDetails.user_metadata.user_name);

            if (returnedStudent === undefined || returnedStudent.length === 0) {
                await supabaseAddStudent(userDetails);
            } else {
                await supabaseUpdateStudent(userDetails)
            }

        } catch (error) {
            console.error("Student Course Interaction Table error: ", error);
        }
    },

    async storeStudentCourseLearningObjectInSupabase(course: Course, lo: Lo, onlineStatus: boolean, userDetails: User) {
        try {
            if (userDetails.user_metadata.full_name === "Anon") return;
            await this.insertOrUpdateCourse(course);
            await this.insertOrUpdateStudent(userDetails);
            await this.insertOrUpdateLoEvent(lo);
            await this.handleInteractionData(course, lo, userDetails);
        } catch (error) {
            console.error("storeStudentCourseLearningObjectInSupabase: ", error);
        }
    },

    async handleInteractionData(course: Course, lo: Lo, userDetails: User) {
        const getInteractionData = await getUserCourses(course.courseId, userDetails.user_metadata.user_name, lo.route);

        if (getInteractionData === null || getInteractionData.length === 0) {
            await insertStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, lo.route);
        } else {
            await updateStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, lo.route);
        }
    },

    async insertOrUpdateCourse(course: any) {
        try {
            const returnedCourses = await getCourses(course.courseId);
            if (returnedCourses === null || returnedCourses.length === 0) {
                await addCourse(course);
            } else {
                await updateCourse(course);
            }
        } catch (error) {
            console.error("insertOrUpdateCourse error: ", error);
        }
    },
};

function getUser(onlineStatus: boolean, userDetails: User): LoUser {
    const user: LoUser = {
        fullName: "Anon",
        avatar: "https://tutors.dev/logo.svg",
        id: getTutorsTimeId()
    };
    if (userDetails && onlineStatus) {
        user.fullName = userDetails.user_metadata.full_name ? userDetails.user_metadata.full_name : userDetails.user_metadata.user_name;
        user.avatar = userDetails.user_metadata.avatar_url;
        user.id = userDetails.user_metadata.user_name;
    }
    return user;
}

function generateTutorsTimeId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function getTutorsTimeId() {
    if (!window.localStorage.tutorsTimeId) {
        window.localStorage.tutorsTimeId = generateTutorsTimeId();
    }
    return window.localStorage.tutorsTimeId;
}
