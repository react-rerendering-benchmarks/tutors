import type { Course, Lo } from "../models/lo-types";
import { db } from "$lib/db/client";
import { supabaseCourses, supabaseStudents } from "$lib/stores";
import type { User } from "@supabase/supabase-js";
import { formatDate } from "./metrics";

export const getNumOfStudentCourseLoDuration = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    const { data, error } = await db
        .from('studentsinteraction')
        .select('duration')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId)
        .single();

    const num = data?.duration || 0;
    const newCount = num + incrementBy;
    return newCount;
};

export const getNumOfStudentCourseLoCount = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    const { data, error } = await db
        .from('studentsinteraction')
        .select('count')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId)
        .single();

    const num = data?.count|| 0;
    const newCount = num + incrementBy;
    return newCount;
};

export async function updateStudentsStatus(key: string, str: string) {
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

export async function getCalendarData(id: string, studentId: string): Promise<any> {
    const { data, error } = await db.from('calendar').select().eq('id', formatDate(new Date())).eq('student_id', studentId);
    return data;
};

export async function insertOrUpdateCalendar(studentId: string) {
    const returnedData = await getCalendarData(formatDate(new Date()), studentId)
    if (returnedData === undefined || returnedData.length === 0) {
        await db
            .from('calendar')
            .insert({
                id: formatDate(new Date()),
                student_id: studentId,
                duration: 1,
                count: 1,
            });
    } else {
        const durationPromise = getDurationTotal("id", "calendar", formatDate(new Date()), 1);
        const countPromise = getCountTotal("id", "calendar", formatDate(new Date()), 1);
        const [duration, count] = await Promise.all([durationPromise, countPromise]);
        await db
            .from('calendar')
            .update({
                duration: duration,
                count: count,
            })
            .eq('id', formatDate(new Date()));
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
            duration: 1,
            count: 1,
            date_last_accessed: new Date().toISOString(),
            img: course.img,
            icon: course.icon
        });

    if (data) {
        supabaseCourses.update(cur => [...cur, data[0]]);
    }
};

export async function updateCourse(course: Course) {
    const durationPromise = getDurationTotal("course_id", "course", course.courseId, 1);
    const countPromise = getCountTotal("course_id", "course", course.courseId, 1);
    const [duration, count] = await Promise.all([durationPromise, countPromise]);
    await db
        .from('course')
        .update({
            duration: duration,
            count: count,
            date_last_accessed: new Date().toISOString(),
        })
        .eq('course_id', course.courseId);
};

export async function getStudentCoursesLearningObjects(courseId: string, studentId: string, loId: string): Promise<any> {
    if (!courseId || !studentId || !loId) {
        console.error("Missing required parameters: courseId and studentId must be provided.");
        return null; 
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
    const { data} = await db
        .from('students')
        .insert({
            id: userDetails.user_metadata.user_name,
            avatar: userDetails.user_metadata.avatar_url,
            full_name: userDetails.user_metadata.full_name,
            email: userDetails.user_metadata.email || "",
            duration: 1,
            date_last_accessed: new Date().toISOString(),
            count: 1,
        });

    if (data) {
        supabaseStudents.update(cur => [...cur, data[0]]);
    }
};

export async function supabaseUpdateStudent(userDetails: User) {
    const durationPromise = getDurationTotal("id", "students", userDetails.user_metadata.user_name, 1);
    const countPromise = getCountTotal("id", "students", userDetails.user_metadata.user_name, 1);
    const [duration, count] = await Promise.all([durationPromise, countPromise]);
    const { data, error } = await db
        .from('students')
        .update({
            avatar: userDetails.user_metadata.avatar_url,
            full_name: userDetails.user_metadata.full_name,
            email: userDetails.user_metadata.email || "",
            duration: duration,
            date_last_accessed: new Date().toISOString(),
            count: count,
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
            duration: 1,
            date_last_accessed: new Date().toISOString(),
            count: 1
        });
};

export async function updateStudentCourseLoTable(courseId: string, studentId: string, loId: string): Promise<any> {
    const durationPromise = getNumOfStudentCourseLoDuration(courseId, studentId, loId, 1);
    const countPromise = getNumOfStudentCourseLoCount(courseId, studentId, loId, 1);
    const [duration, count] = await Promise.all([durationPromise, countPromise]);
    await db
        .from('studentsinteraction')
        .update({
            duration: duration,
            date_last_accessed: new Date().toISOString(),
            count: count,
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

export async function addLo(loid: string, currentLo: Lo) {
    const { error } = await db
        .from('learningobject')
        .insert({
            id: loid,
            type: currentLo.type,
            name: currentLo.title,
            date_last_accessed: new Date().toISOString(),
            parent: currentLo.parentLo ? currentLo.parentLo.route : null,
            lo_img: currentLo.img,
            icon: currentLo.icon
        });
};

export async function updateLo(loid: string, currentLo: Lo) {
    await db
        .from('learningobject')
        .update({
            date_last_accessed: new Date().toISOString(),
        })
        .eq('id', loid);
};

export const updateStudentCourseLoInteractionDuration = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    const numOfDuration = await getNumOfStudentCourseLoDuration(courseId, studentId, loId, incrementBy);
    const num = numOfDuration || 0;
    const newCount = num + incrementBy;

    await db
        .from('studentsinteraction')
        .update({ 'duration': newCount })
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId);
};

export const updateStudentCourseLoInteractionCount = async (courseId: string, studentId: string, loId: string, incrementBy: number) => {
    const numOfCount = await getNumOfStudentCourseLoCount(courseId, studentId, loId, incrementBy);
    let num = numOfCount?.count || 0;
    const newCount = num + incrementBy;

    await db
        .from('studentsinteraction')
        .update({ 'count': newCount })
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId);
};

export const getDurationTotal = async (key: string, table: string, id: string, incrementBy: number) => {
    const { data, error } = await db
        .from(table)
        .select('duration')
        .eq(key, id)
        .single();

    if (data === null || data === undefined) {
        console.warn(`No data found for ${table} with ${key} ${id}`);
        return null;
    }

    const num = data?.duration || 0;
    const newCount = num + incrementBy;
    return newCount;
};

export const getCountTotal = async (key: string, table: string, id: string, incrementBy: number) => {
    const { data, error } = await db
        .from(table)
        .select('count')
        .eq(key, id)
        .single();

    if (data === null || data === undefined) {
        console.warn(`No data found for ${table} with ${key} ${id}`);
        return null;
    }

    const num = data?.count || 0;
    const newCount = num + incrementBy;
    return newCount;
};

export const updateCount= async (key: string, table: string, id: string, incrementBy: number) => {
    const { data, error } = await db
        .from(table)
        .select('count')
        .eq(key, id)
        .single();

    const num = data?.count || 0;
    const newCount = num + incrementBy;

    await db
        .from(table)
        .update({ 'count': newCount })
        .eq(key, id);
};

export const updateDuration = async (key: string, table: string, id: string, incrementBy: number) => {
    const { data, error } = await db
        .from(table)
        .select('duration')
        .eq(key, id)
        .single();

    const num = data?.duration|| 0;
    const newCount = num + incrementBy;
    await db
        .from(table)
        .update({ 'duration': newCount })
        .eq(key, id);
};

export async function insertOrUpdateLoEvent(loid: string, currentLo: Lo) {
    const { data, error } = await db.from('learningobject').select().eq('id', loid);
    if (data === null || data.length === 0) {
        await addLo(loid, currentLo);
    } else {
        await updateLo(loid, currentLo);
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

export async function storeStudentCourseLearningObjectInSupabase(course: Course, loid:string, lo: Lo, userDetails: User) {
    if (userDetails?.user_metadata.full_name === "Anon") return;
    await insertOrUpdateCourse(course);
    await insertOrUpdateStudent(userDetails);
    await insertOrUpdateLoEvent(loid, lo);
    await handleInteractionData(course,loid, lo, userDetails);
    await insertOrUpdateCalendar(userDetails.user_metadata.user_name);
};

export async function handleInteractionData(course: Course,loid: string, lo: Lo, userDetails: User) {
    const getInteractionData = await getStudentCoursesLearningObjects(course.courseId, userDetails.user_metadata.user_name, loid);

    if (getInteractionData === null || getInteractionData.length === 0) {
        await insertStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, loid);
    } else {
        await updateStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, loid);
    }
};

export async function insertOrUpdateCourse(course: any) {
        const returnedCourses = await getCourses(course.courseId);
        if (returnedCourses === null || returnedCourses.length === 0) {
            await addCourse(course);
        } else {
            await updateCourse(course);
        }
};
