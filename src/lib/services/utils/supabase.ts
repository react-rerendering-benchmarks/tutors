import type { Course, Lo } from "../models/lo-types";
import { db } from "$lib/db/client";
import type { User } from "@supabase/supabase-js";
import { formatDate } from "./metrics";

export async function getNumOfStudentCourseLoIncrements(fieldName: string, courseId: string, studentId: string, loId: string) {
  if (!courseId || !studentId || !loId) return 0;

  const { data: student, error } = await db.rpc('get_count_studentsinteraction', {
    field_name: fieldName,
    course_base: courseId,
    user_name: studentId,
    lo_key: loId
  });

  if (error) {
    console.error('Error fetching student interaction:', error);
    return 0;
  }
  return student ? student[0].increment + 1 : 1;
};

export async function updateStudentsStatus(key: string, str: string) {
  await db.from('students').update({ online_status: str, }).eq('id', key);
};

export async function readValue(key: string): Promise<any> {
  const { data, error } = await db.from('students').select().eq('id', key);
  return data;
};

export async function getAllCalendarData(courseId: string, studentId: string): Promise<any> {
  const { data, error } = await db.from('calendar').select().eq('student_id', studentId).eq('course_id', courseId);
  return data;
};

export async function getCalendarDuration(id: string, studentId: string, courseId: string): Promise<number> {
  const { data } = await db.from('calendar').select('duration').eq('id', id).eq('student_id', studentId).eq('course_id', courseId).single();
  return data?.duration || 1;
};

export async function getDurationTotal(key: string, table: string, id: string): Promise<number> {
  const { data } = await db.from(table).select('duration').eq(key, id).single();
  return data?.duration || 1;
};

export async function insertOrUpdateCalendar(studentId: string, courseId: string) {
  const durationPromise = getCalendarDuration(formatDate(new Date()), studentId, courseId);
  const countPromise = updateCalendarCount(formatDate(new Date()), studentId, courseId);
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

export async function insertOrUpdateCourse(course: Course) {
  const durationPromise = getDurationTotal("course_id", "course", course.courseId);
  const countPromise = updateCount("course_id", "course", course.courseId);
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

export async function addOrUpdateStudent(userDetails: User) {
  const durationPromise = getDurationTotal("id", "students", userDetails.user_metadata.user_name);
  const countPromise = updateCount("id", "students", userDetails.user_metadata.user_name);
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

  if (error) throw error;
};

export async function updateLastAccess(key: string, id: string, table: any): Promise<any> {
  const { error: updateError } = await db.from(table).update({ date_last_accessed: new Date().toISOString() }).eq(key, id);
  if (updateError) {
    throw updateError;
  }
};

export async function addOrUpdateLo(loid: string, currentLo: Lo, loTitle: string) {
  if (!loid) return;
  const { error } = await db
    .from('learningobject')
    .upsert({
      id: loid,
      type: currentLo?.type,
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

  if (error) throw error;
};

export async function updateStudentCourseLoInteractionDuration(courseId: string, studentId: string, loId: string) {
  const numOfDuration = await getNumOfStudentCourseLoIncrements('duration', courseId, studentId, loId);

  await db
    .from('studentsinteraction')
    .update({ 'duration': numOfDuration })
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('lo_id', loId);
};

export async function updateCount(key: string, table: string, id: string) {
  if (!key || !table || !id) return;
  await db.rpc('increment_field', { table_name: table, field_name: 'count', key: key, row_id: id });
};

export async function updateDuration(key: string, table: string, id: string) {
  if (!key || !table || !id) return;
  await db.rpc('increment_field', { table_name: table, field_name: 'duration', key: key, row_id: id });
};

export const updateCalendarCount = async (id: string, studentId: string, courseId: string) => {
  if (!id || !studentId || !courseId) return;
  await db.rpc('increment_calendar', { field_name: 'count', row_id: id, student_id_value: studentId, course_id_value: courseId });
};

export const updateCalendarDuration = async (id: string, studentId: string, courseId: string) => {
  if (!id || !studentId || !courseId) return;
  await db.rpc('increment_calendar', { field_name: 'duration', row_id: id, student_id_value: studentId, course_id_value: courseId });
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
  if (!courseId || !studentId || !loId) return;
  await manageStudentCourseLo(courseId, studentId, loId);
};

export function studentInteractionsUpdates(callback) {
  db
    .channel('schema-db-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'calendar'
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
};

export async function manageStudentCourseLo(courseId: string, studentId: string, loId: string) {
  const durationPromise = getNumOfStudentCourseLoIncrements('duration', courseId, studentId, loId);
  const countPromise = getNumOfStudentCourseLoIncrements('count', courseId, studentId, loId);
  const [duration, count] = await Promise.all([durationPromise, countPromise]);
  const { error } = await db
    .from('studentsinteraction')
    .upsert({
      course_id: courseId,
      student_id: studentId,
      lo_id: loId,
      date_last_accessed: new Date().toISOString(),
      duration: duration,
      count: count
    }, {
      onConflict: 'student_id, course_id, lo_id',
      ignoreDuplicates: false
    });
  if (error) throw error;
};

export function getLoTitle(params: any): string | undefined {
  if (params.lab?.currentChapterTitle !== undefined) {
    return params.lab.currentChapterTitle;
  } else if (params.lo?.title !== undefined) {
    return params.lo.title;
  } else if (params.lo?.id !== undefined) {
    return params.lo.id;
  } else if (params.topic?.title !== undefined) {
    return params.topic.title;
  } else {
    return undefined;
  }
};