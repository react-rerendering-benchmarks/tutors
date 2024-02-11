import type { Course, Lo } from "../models/lo-types";
import { db } from "$lib/db/client";
import { supabaseCourses, supabaseStudents } from "$lib/stores";
import type { User } from "@supabase/supabase-js";
import { formatDate } from "./firebase";
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

export const getNumOfStudentCourseLoPageActive = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from('studentsinteraction')
            .select('page_active')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId)
            .single();

        const num = data?.page_active || 0;
        const newCount = num + incrementBy;
        return newCount;

    } catch (error: any) {
        console.error(`Error updating how long the page is active for studentsinteraction: ${error.message}`);
    }
};

export const getNumOfStudentCourseLoPageLoads = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from('studentsinteraction')
            .select('page_loads')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId)
            .single();

        const num = data?.page_loads || 0;
        const newCount = num + incrementBy;
        return newCount;

    } catch (error: any) {
        console.error(`Error updating how long the page is active for studentsinteraction: ${error.message}`);
    }
};

export async function supabaseUpdateStr(key: string, str: string) {
    try {
        await db
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
            await db
                .from('calendar')
                .insert({
                    id: formatDate(new Date()),
                    student_id: id,
                    page_active: 1,
                    page_loads: 1,
                });
        } else {
            const pageActivePromise = getActivePageTotal("student_id", "calendar", id, 1);
            const pageLoadsPromise = getPageLoadsTotal("student_id", "calendar", id, 1);
            const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
            await db
                .from('calendar')
                .update({
                    page_active: pageActive,
                    page_loads: pageLoads,
                })
                .eq('student_id', id);
        }
    } catch (error: any) {
        console.log(`TutorStore Error: ${error.message}`);
    }
}

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

export async function addCourse(course: Course) {
    try {
        if (!course) {
            throw new Error('Invalid input data. courseId and title must be provided.');
        }
        const { data, error } = await db
            .from('course')
            .insert({
                course_id: course.courseId,
                title: course.title,
                page_active: 1,
                page_loads: 1,
                date_last_accessed: new Date().toISOString(),
                img: course.img,
            });

        if (data) {
            supabaseCourses.update(cur => [...cur, data[0]]);
        }
    } catch (error) {
        console.log('Error adding course:', error);
    }
};

export async function updateCourse(course: Course) {
    try {
        const pageActivePromise = getActivePageTotal("course_id", "course", course.courseId, 1);
        const pageLoadsPromise = getPageLoadsTotal("course_id", "course", course.courseId, 1);
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

export async function getStudentCoursesLearningObjects(courseId: string, studentId: string, loId: string): Promise<any> {
    if (!courseId || !studentId || !loId) {
        console.error("Missing required parameters: courseId and studentId must be provided.");
        return null; // Or you can return a custom error object
    }

    const { data, error } = await db
        .from('studentsinteraction')
        .select()
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .eq('lo_id', loId);
    if (error) {
        console.error('Error fetching studentsinteraction:', error);
    }
    return data;
};

export async function getCourses(courseId: string): Promise<any> {
    try {
        const { data, error } = await db.from('course').select().eq('course_id', courseId);
        return data;
    } catch (error) {
        console.error('Error fetching course:', error);
    }
};

export async function getStudents(studentId: string): Promise<any> {
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
        const { data, error: insertError } = await db
            .from('students')
            .insert({
                id: userDetails.user_metadata.user_name,
                avatar: userDetails.user_metadata.avatar_url,
                full_name: userDetails.user_metadata.full_name,
                email: userDetails.user_metadata.email || "",
                page_active: 1,
                date_last_accessed: new Date().toISOString(),
                page_loads: 1,
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
        const pageLoadsPromise = getPageLoadsTotal("id", "students", userDetails.user_metadata.user_name, 1);
        const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
        const { data, error } = await db
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

export async function insertStudentCourseLoTable(courseId: string, studentId: string, loId: string): Promise<any> {
    try {
        await db
            .from('studentsinteraction')
            .insert({
                course_id: courseId,
                student_id: studentId,
                lo_id: loId,
                page_active: 1,
                date_last_accessed: new Date().toISOString(),
                page_loads: 1
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
            .from('studentsinteraction')
            .update({
                page_active: pageActive,
                date_last_accessed: new Date().toISOString(),
                page_loads: pageLoads,
            })
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId);
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

export async function addLo(currentLo: Lo) {
    try {
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

export const updateStudentCourseLoInteractionPageActive = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const numOfPageActive= await getNumOfStudentCourseLoPageActive(courseId, studentId, loId, incrementBy);

        const num = numOfPageActive?.page_active || 0;
        const newCount = num + incrementBy;

        await db
            .from('studentsinteraction')
            .update({ 'page_active': newCount })
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId);

    } catch (error: any) {
        console.error(`Error updating how long the page is active for studentsinteraction: ${error.message}`);
    }
};

export const updateStudentCourseLoInteractionPageLoads = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    try {
        const numOfPageLoads = await getNumOfStudentCourseLoPageLoads(courseId, studentId, loId, incrementBy);

        let num = numOfPageLoads?.page_loads || 0;
        const newCount = num + incrementBy;

        await db
            .from('studentsinteraction')
            .update({ 'page_loads': newCount })
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .eq('lo_id', loId);

    } catch (error: any) {
        console.error(`Error updating how long the page is active for studentsinteraction: ${error.message}`);
    }
};

export const getActivePageTotal = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_active')
            .eq(key, id)
            .single();

        if (data === null || data === undefined) {
            console.log(`No data found for ${table} with ${key} ${id}`);
            return null;
        }

        const num = data?.page_active || 0;
        const newCount = num + incrementBy;
        return newCount;
    } catch (error: any) {
        console.error(`Error updating how long the page is active for ${table}: ${error.message}`);
    }
};

export const getPageLoadsTotal = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_loads')
            .eq(key, id)
            .single();

        if (data === null || data === undefined) {
            console.log(`No data found for ${table} with ${key} ${id}`);
            return null; // or handle the absence of data accordingly
        }

        const num = data?.page_loads || 0;
        const newCount = num + incrementBy;
        return newCount;
    } catch (error: any) {
        console.error(`Error updating how many time page was loaded for ${table}: ${error.message}`);
    }
};

export const updatePageLoads = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_loads')
            .eq(key, id)
            .single();

        const num = data?.page_loads || 0;
        const newCount = num + incrementBy;

        await db
            .from(table)
            .update({ 'page_loads': newCount })
            .eq(key, id);

    } catch (error: any) {
        console.error(`Error updating count for table ${table}: ${error.message}`);
    }
};

export const updatePageActive = async (key: string, table: string, id: string, incrementBy: number) => {
    try {
        const { data, error } = await db
            .from(table)
            .select('page_active')
            .eq(key, id)
            .single();

        const num = data?.page_active || 0;
        const newCount = num + incrementBy;
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
            const returnedStudent = await getStudents(userDetails.user_metadata.user_name);

            if (returnedStudent === undefined || returnedStudent.length === 0) {
                await supabaseAddStudent(userDetails);
            } else {
                await supabaseUpdateStudent(userDetails)
            }

        } catch (error) {
            console.error("Student Course Interaction Table error: ", error);
        }
    },

    async storeStudentCourseLearningObjectInSupabase(course: Course, lo: Lo, userDetails: User) {
        try {
            if (userDetails?.user_metadata.full_name === "Anon") return;
            await this.insertOrUpdateCourse(course);
            await this.insertOrUpdateStudent(userDetails);
            await this.insertOrUpdateLoEvent(lo);
            await this.handleInteractionData(course, lo, userDetails);
        } catch (error) {
            console.error("storeStudentCourseLearningObjectInSupabase: ", error);
        }
    },

    async handleInteractionData(course: Course, lo: Lo, userDetails: User) {
        const getInteractionData = await getStudentCoursesLearningObjects(course.courseId, userDetails.user_metadata.user_name, lo.route);

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
