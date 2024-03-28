import type { Course, Lo } from "../models/lo-types";
import { db } from "$lib/db/client";
import { supabaseCourses, supabaseStudents } from "$lib/stores";
import type { User } from "@supabase/supabase-js";
import { formatDate } from "./metrics";

export async function getNumOfStudentCourseLoDuration(courseId: string, studentId: string, loId: string) {
    let query = db
        .from('studentsinteraction')
        .select('duration')
        .eq('student_id', studentId)
        .eq('course_id', courseId);

    if (loId) {
        query = query.eq('lo_id', loId);
    }

    const { data, error } = await query.single();

    const num = data?.duration || 0;
    const newCount = num + 1;
    return newCount;
};

export async function getNumOfStudentCourseLoCount(courseId: string, studentId: string, loId: string) {
    let query = db
        .from('studentsinteraction')
        .select('count')
        .eq('student_id', studentId)
        .eq('course_id', courseId);

    if (loId) {
        query = query.eq('lo_id', loId);
    }

    const { data, error } = await query.single();

    const num = data?.count || 0;
    const newCount = num + 1;
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

export async function getAllCalendarData(courseId: string, studentId: string): Promise<any> {
    const { data, error } = await db.from('calendar').select().eq('student_id', studentId).eq('course_id', courseId);
    return data;
};

export async function getCalendarData(id: string, studentId: string, courseId: string): Promise<any> {
    const { data, error } = await db.from('calendar').select().eq('id', formatDate(new Date())).eq('student_id', studentId).eq('course_id', courseId);
    return data;
};

export async function insertOrUpdateCalendar(studentId: string, courseId: string) {
    const durationPromise = getCalendarDurationTotal(formatDate(new Date()), studentId, courseId);
    const countPromise = getCalendarCountTotal(formatDate(new Date()), studentId, courseId);
    const [duration, count] = await Promise.all([durationPromise, countPromise]);
    await db
        .from('calendar')
        .upsert({
            id: formatDate(new Date()),
            student_id: studentId,
            duration: duration,
            count: count,
            course_id: courseId
        }, {
            onConflict: 'id, student_id, course_id'
        });
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
    const durationPromise = getDurationTotal("course_id", "course", course.courseId);
    const countPromise = getCountTotal("course_id", "course", course.courseId);
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

export async function insertOrUpdateCourse(course: Course) {
    const durationPromise = getDurationTotal("course_id", "course", course.courseId);
    const countPromise = getCountTotal("course_id", "course", course.courseId);
    const [duration, count] = await Promise.all([durationPromise, countPromise]);
    await db
        .from('course')
        .upsert({
            course_id: course.courseId,
            title: course.title,
            duration: duration,
            count: count,
            date_last_accessed: new Date().toISOString(),
            img: course.img,
            icon: course.icon
        }, {
            onConflict: 'course_id'
        });
};

export async function getStudentCoursesLearningObjects(courseId: string, studentId: string, loId: string): Promise<any> {
    if (!courseId || !studentId) {
        throw new Error("Missing required parameters: courseId and studentId must be provided.");
    }

    let query = db
        .from('studentsinteraction')
        .select()
        .eq('course_id', courseId)
        .eq('student_id', studentId);

    if (loId) {
        query = query.eq('lo_id', loId);
    }
    const { data, error } = await query.single();

    if (error) {
        console.error(error);
        return null;
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

export async function addOrUpdateStudent(userDetails: User) {
    const durationPromise = getDurationTotal("id", "students", userDetails.user_metadata.user_name);
    const countPromise = getCountTotal("id", "students", userDetails.user_metadata.user_name);
    const [duration, count] = await Promise.all([durationPromise, countPromise]);
    const { data, error } = await db
        .from('students')
        .upsert({
            id: userDetails.user_metadata.user_name,
            avatar: userDetails.user_metadata.avatar_url,
            full_name: userDetails.user_metadata.full_name,
            email: userDetails.user_metadata.email || "",
            duration: duration,
            date_last_accessed: new Date().toISOString(),
            count: count,
        }, {
            onConflict: 'id'
        });

        if(error) throw error;

    if (data) {
        supabaseStudents.update(cur => [...cur, data[0]]);
    }
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

export async function updateLastAccess(key: string, id: string, table: any): Promise<any> {
    const { error: updateError } = await db
        .from(table)
        .update({ date_last_accessed: new Date().toISOString() })
        .eq(key, id);

    if (updateError) {
        throw updateError;
    }
};

export async function addOrUpdateLo(loid: string, currentLo: Lo, loTitle: string) {
    if(!loid) return;
    const { error } = await db
        .from('learningobject')
        .upsert({
            id: loid,
            type: currentLo.type,
            name: loTitle,
            date_last_accessed: new Date().toISOString(),
            parent: currentLo.parentLo ? currentLo.parentLo.route : null,
            child: currentLo.route,
            lo_img: currentLo.img,
            icon: currentLo.icon,
            topic_title: currentLo.parentTopic ? currentLo.parentTopic.title : null,
            lab_title: currentLo.type === 'lab' ? currentLo.title : null,
        }, {
            onConflict: 'id'
        });

        if(error) throw error;
};

export async function updateStudentCourseLoInteractionDuration(courseId: string, studentId: string, loId: string) {
    const numOfDuration = await getNumOfStudentCourseLoDuration(courseId, studentId, loId);
    const num = numOfDuration || 0;
    const newCount = num + 1;

    await db
        .from('studentsinteraction')
        .update({ 'duration': newCount })
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId);
};

export async function updateStudentCourseLoInteractionCount(courseId: string, studentId: string, loId: string) {
    const numOfCount = await getNumOfStudentCourseLoCount(courseId, studentId, loId);
    let num = numOfCount?.count || 0;
    const newCount = num + 1;

    await db
        .from('studentsinteraction')
        .update({ 'count': newCount })
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('lo_id', loId);
};

export async function getDurationTotal(key: string, table: string, id: string) {
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
    const newCount = num + 1;
    return newCount;
};

export async function getCountTotal(key: string, table: string, id: string): Promise<number> {
    const { data, error } = await db
        .from(table)
        .select('count')
        .eq(key, id)
        .single();

    if (data === null || data === undefined) {
        console.warn(`No data found for ${table} with ${key} ${id}`);
        return 0;
    }

    const num = data?.count || 0;
    const newCount = num + 1;
    return newCount;
};

export async function getCalendarDurationTotal(id: string, studentId: string, courseId: string): Promise<number> {
    const { data, error } = await db
        .from('calendar')
        .select('duration')
        .eq('id', id)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single();

    if (data === null || data === undefined) {
        console.warn(`No data found for the calendar with ${id} ${studentId}`);
        return 0;
    }

    const num = data?.duration || 0;
    const newCount = num + 1;
    return newCount;
};

export async function getCalendarCountTotal(id: string, studentId: string, courseId: string): Promise<number> {
    const { data, error } = await db
        .from('calendar')
        .select('count')
        .eq('id', id)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single();

    if (data === null || data === undefined) {
        console.warn(`No data found for the calendar with ${id} ${studentId}`);
        return 0;
    }

    const num = data?.count || 0;
    const newCount = num + 1;
    return newCount;
};

export async function updateCount(key: string, table: string, id: string) {
    const { data, error } = await db
        .from(table)
        .select('count')
        .eq(key, id)
        .single();

    const num = data?.count || 0;
    const newCount = num + 1;

    await db
        .from(table)
        .update({ 'count': newCount })
        .eq(key, id);
};

export async function updateDuration(key: string, table: string, id: string) {
    const { data, error } = await db
        .from(table)
        .select('duration')
        .eq(key, id)
        .single();

    const num = data?.duration || 0;
    const newCount = num + 1;
    await db
        .from(table)
        .update({ 'duration': newCount })
        .eq(key, id);
};

export const updateCalendarCount = async (id: string, studentId: string, courseId: string) => {
    const { data, error } = await db
        .from('calendar')
        .select('count')
        .eq('id', id)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single();

    const num = data?.count || 0;
    const newCount = num + 1;

    await db
        .from('calendar')
        .update({ 'count': newCount })
        .eq('id', id)
        .eq('student_id', studentId)
        .eq('course_id', courseId);
};

export const updateCalendarDuration = async (id: string, studentId: string, courseId: string) => {
    const { data, error } = await db
        .from('calendar')
        .select('duration')
        .eq('id', id)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .single();

    const num = data?.duration || 0;
    const newCount = num + 1;
    await db
        .from('calendar')
        .update({ 'duration': newCount })
        .eq('id', id)
        .eq('student_id', studentId)
        .eq('course_id', courseId);
};

export async function storeStudentCourseLearningObjectInSupabase(course: Course, params: any, loid: string, lo: Lo, userDetails: User) {
    const loTitle = getLoTitle(params)
    if (userDetails?.user_metadata.full_name === "Anon") return;
    await insertOrUpdateCourse(course);
    await addOrUpdateStudent(userDetails);
    await addOrUpdateLo(loid, lo, loTitle);
    await handleInteractionData(course.courseId, userDetails.user_metadata.user_name, loid);
    await insertOrUpdateCalendar(userDetails.user_metadata.user_name, course.courseId);
};

export async function handleInteractionData(courseId: string, studentId: string, loId: string) {
    const interactionInfo = await getStudentCoursesLearningObjects(courseId, studentId, loId)
    if (interactionInfo.length === 0 || interactionInfo === null) {
        await addStudentCourseInteraction(courseId, studentId, loId);
    } else {
        await updateStudentCourseLoTable(courseId, studentId, loId);
    }
};

export async function updateStudentCourseLoTable(courseId: string, studentId: string, loId: string) {
    const durationPromise = getNumOfStudentCourseLoDuration(courseId, studentId, loId);
    const countPromise = getNumOfStudentCourseLoCount(courseId, studentId, loId);
    const [duration, count] = await Promise.all([durationPromise, countPromise]);

    let query = db.from('studentsinteraction')
        .update({
            duration: duration,
            date_last_accessed: new Date().toISOString(),
            count: count,
        })
        .eq('student_id', studentId)
        .eq('course_id', courseId);

    if (loId) {
        query = query.eq('lo_id', loId);
    }

    const { data, error } = await query.single();
};

export async function addStudentCourseInteraction(courseId: string, studentId: string, loId: string) {
    await db
        .from('studentsinteraction')
        .insert({
            student_id: studentId,
            course_id: courseId,
            lo_id: loId,
            duration: 1,
            date_last_accessed: new Date().toISOString(),
            count: 1,
        });

};

export function getLoTitle(params: any): string | undefined {
    if (params.lab || params.lab?.currentChapterTitle !== undefined) {
        return params.lab.currentChapterTitle;
    } else if (params.lo || params.lo?.title !== undefined) {
        return params.lo.title
    } else if (params.lo || params.lo?.id !== undefined) {
        return params.lo.id
    } else if (params.topic || params.topic?.title !== undefined) {
        return params.topic.title;
    } else {
        return undefined;
    }
};
