import type { Course, Lo } from "../models/lo-types";
import { db } from "$lib/db/client";
import { supabaseCourses, supabaseStudents } from "$lib/stores";
import type { User } from "@supabase/supabase-js";
import { formatDate } from "./firebase";

export const getNumOfStudentCourseLoPageActive = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
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
};

export const getNumOfStudentCourseLoPageLoads = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
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
};

export async function supabaseUpdateStr(key: string, str: string) {
    await db
        .from('students')
        .update({
            online_status: str,
        }).eq('id', key);
};

export async function readValue(key: string): Promise<any> {
    const { data, error } = await db.from('students').select().eq('id', key);
    return data;
};

export async function getCalendarData(id: string): Promise<any> {
    const { data, error } = await db.from('calendar').select().eq('id', formatDate(new Date())).eq('student_id', id);
    return data;
};

export async function updateCalendar(weeks: any, id: string) {
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
};

export const loadCourses = async () => {
    const { data, error } = await db.from('course').select();
    if (error) {
        throw error;
    }
    supabaseCourses.set(data);
};

export async function addCourse(course: Course) {
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
};

export async function updateCourse(course: Course) {
    const pageActivePromise = getActivePageTotal("course_id", "course", course.courseId, 1);
    const pageLoadsPromise = getPageLoadsTotal("course_id", "course", course.courseId, 1);
    const [pageActive, pageLoads] = await Promise.all([pageActivePromise, pageLoadsPromise]);
    await db
        .from('course')
        .update({
            page_active: pageActive,
            page_loads: pageLoads,
            date_last_accessed: new Date().toISOString(),
            img: course.img,
        })
        .eq('course_id', course.courseId);
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
    const { data, error } = await db.from('course').select().eq('course_id', courseId);
    return data;
};

export async function getStudents(studentId: string): Promise<any> {
    if (!studentId) return;
    const { data } = await db.from('students').select().eq('id', studentId);
    return data;
};

export async function supabaseAddStudent(userDetails: User) {
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
};

export async function supabaseUpdateStudent(userDetails: User) {
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
};

export async function insertStudentCourseLoTable(courseId: string, studentId: string, loId: string): Promise<any> {
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
};

export async function updateStudentCourseLoTable(courseId: string, studentId: string, loId: string): Promise<any> {
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
};

export const updateLastAccess = async (key: string, id: string, table: any): Promise<any> => {
    const { error: updateError } = await db
        .from(table)
        .update({ date_last_accessed: new Date().toISOString() })
        .eq(key, id);

    if (updateError) {
        throw updateError;
    }
};

export async function addLo(currentLo: Lo) {
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
};

export async function updateLo(currentLo: Lo) {
    await db
        .from('learning-object')
        .update({
            date_last_accessed: new Date().toISOString(),
        })
        .eq('id', currentLo.route);
};

export const updateStudentCourseLoInteractionPageActive = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    const numOfPageActive = await getNumOfStudentCourseLoPageActive(courseId, studentId, loId, incrementBy);
    const num = numOfPageActive?.page_active || 0;
    const newCount = num + incrementBy;

    await db
        .from('studentsinteraction')
        .update({ 'page_active': newCount })
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId);
};

export const updateStudentCourseLoInteractionPageLoads = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    const numOfPageLoads = await getNumOfStudentCourseLoPageLoads(courseId, studentId, loId, incrementBy);

    let num = numOfPageLoads?.page_loads || 0;
    const newCount = num + incrementBy;

    await db
        .from('studentsinteraction')
        .update({ 'page_loads': newCount })
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId);
};

export const getActivePageTotal = async (key: string, table: string, id: string, incrementBy: number) => {
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
};

export const getPageLoadsTotal = async (key: string, table: string, id: string, incrementBy: number) => {
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
};

export const updatePageLoads = async (key: string, table: string, id: string, incrementBy: number) => {
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
};

export const updatePageActive = async (key: string, table: string, id: string, incrementBy: number) => {
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
};

export async function insertOrUpdateLoEvent(currentLo: Lo) {
    const { data, error } = await db.from('learning-object').select().eq('id', currentLo.route);
    if (data === null || data.length === 0) {
        await addLo(currentLo);
    } else {
        await updateLo(currentLo);
    }
};

export async function insertOrUpdateStudent(userDetails: User) {
    if (userDetails.user_metadata.full_name === "Anon") return;
    const returnedStudent = await getStudents(userDetails.user_metadata.user_name);

    if (returnedStudent === undefined || returnedStudent.length === 0) {
        await supabaseAddStudent(userDetails);
    } else {
        await supabaseUpdateStudent(userDetails)
    }
};

export async function storeStudentCourseLearningObjectInSupabase(course: Course, lo: Lo, userDetails: User) {
    if (userDetails?.user_metadata.full_name === "Anon") return;
    await insertOrUpdateCourse(course);
    await insertOrUpdateStudent(userDetails);
    await insertOrUpdateLoEvent(lo);
    await handleInteractionData(course, lo, userDetails);
};

export async function handleInteractionData(course: Course, lo: Lo, userDetails: User) {
    const getInteractionData = await getStudentCoursesLearningObjects(course.courseId, userDetails.user_metadata.user_name, lo.route);

    if (getInteractionData === null || getInteractionData.length === 0) {
        await insertStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, lo.route);
    } else {
        await updateStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, lo.route);
    }
};

export async function insertOrUpdateCourse(course: any) {
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
};
