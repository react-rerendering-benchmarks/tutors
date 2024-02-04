import type { Course, Lo } from "../models/lo-types";
import { writable, type Writable } from "svelte/store";
import type { SupabaseCourse, SupabaseLearningObject, SupabaseStudent, ResponseData } from "$lib/services/types/supabase";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { db } from "$lib/db/client";
import { currentSupabaseCourse, supabaseCourses, supabaseLearningObjects, supabaseStudents } from "$lib/stores";
import type { User } from "@supabase/supabase-js";
import type { LoEvent, LoUser } from "../types/presence";

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

export function supabaseSanitise(str: string): string {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[`#$.\[\]]/gi, "*");
}

export async function supabaseUpdateStr(key: string, str: string) {
  try {
    const { data, error } = await db
      .from('students')
      .update({
        online_status: str,
      }).eq('id', key);
    console.log(`${key} updated status to ${str}`);
  } catch (error: any) {
    console.log(`TutorStore Error: ${error.message}`);
  }
};

export async function readValue(key: string): Promise<any> {
  try {
    const { data, error } = await db.from('students').select().eq('id', key);
    console.log(`${key} updated status to ${data}`);
    return data;

  } catch (error: any) {
    console.log(`TutorStore Error: ${error.message}`);
  }
};

export async function updateCalendar(id: string) {
try{
  const { data, error } = await db
    .from('calendar')
    .insert({
      student_id: id,
      page_active: await updatePageActive("student_id", "calendar", id, 1),
      page_loads: await updatePageLoads("student_id", "calendar", id, 1),
      date_last_accessed: new Date().toISOString(),
    });
  } catch (error: any) {
    console.log(`TutorStore Error: ${error.message}`);
  }
};


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
    console.error('Error loading courses:', error);
  }
};

export const addCourse = async (course: Course): Promise<ResponseData> => {
  let response: ResponseData;
  console.log("Adding course...", course);
  try {
    const { data, error } = await db
      .from('course')
      .insert({
        course_id: course.courseId,
        title: course.courseTitle,
        page_active: await updatePageActive("course_id", "course", course.courseId, 1),
        page_loads: await updatePageLoads("course_id", "course", course.courseId, 1),
        date_last_accessed: new Date().toISOString(),
        img: course.img,
      });
    if (data) supabaseCourses.update(cur => [...cur, data[0]]);
    if (error) {
      console.error('Error adding course:', error);
      response = {
        status: 400,
        message: 'Adding course failed: ',
      };
    } else {
      response = {
        status: 201,
        message: 'Adding course successfully',
      };
    }
  } catch (error) {
    console.error('Error adding course:', error);
    response = {
      status: 400,
      message: 'Adding course failed',
    };
  }
  return response;
};

export const updateCourse = async (course: Course): Promise<ResponseData> => {
  let response: ResponseData;
  try {
    const { data, error } = await db
      .from('course')
      .update({
        page_active: await updatePageActive("course_id", "course", course.courseId, 1),
        page_loads: await updatePageLoads("course_id", "course", course.courseId, 1),
        date_last_accessed: new Date().toISOString(),
        img: course.img,
      }).eq('course_id', course.courseId);

    if (error) {
      console.error('Error updating course:', error);
      response = {
        status: 500, // Internal Server Error
        message: 'Update failed',
      };
    } else {
      response = {
        status: 204, // No Content (Success)
        message: 'Updated successfully',
      };
    }
  } catch (error) {
    console.error('Error updating course:', error);
    response = {
      status: 500, // Internal Server Error
      message: 'Update failed',
    };
  }
  return response;
};

export const getUserCourses = async (courseId: string, studentId: string, loId: string): Promise<any> => {
  if (!courseId || !studentId) return;
  const { data, error } = await db.from('student-course-interaction').select().eq('course_id', courseId).eq('student_id', studentId).eq('lo_id', loId);
  if (error) {
    return console.error(error);
  }
  return data;
};

export const getCourses = async (courseId: string): Promise<any> => {
  if (!courseId) return;
  const { data, error } = await db.from('course').select().eq('course_id', courseId);
  if (error) {
    return console.error(error);
  }
  return data;
};

/*********************************************
 * *********** Student Functions *************
 */

export const getUsers = async (studentId: string): Promise<any> => {
  if (!studentId) return;
  const { data, error } = await db.from('students').select().eq('id', studentId);
  if (error) {
    return console.error(error);
  }
  return data;
};

export async function supabaseAddStudent(course: Course, userDetails: any): Promise<ResponseData> {
  let response: ResponseData;
  try {
    console.log("Adding Student...", userDetails);
    const { data, error: updateError } = await db
      .from('students')
      .insert({
        id: userDetails.user_metadata.user_name,
        avatar: userDetails.user_metadata.avatar_url,
        full_name: userDetails.user_metadata.full_Name,
        email: userDetails.user_metadata.email || "",
        page_active: await updatePageActive("id", "students", userDetails.user_metadata.user_name, 1),
        date_last_accessed: new Date().toISOString(),
        page_loads: await updatePageLoads("id", "students", userDetails.user_metadata.user_name, 1),
      })
    if (data) supabaseStudents.update(cur => [...cur, data[0]]);
    if (updateError) {
      console.error('Error adding Student:', updateError);
      response = {
        status: 400, // Internal Server Error
        message: 'Adding student failed: ',
      };
    } else {
      response = {
        status: 201, // No Content (Success)
        message: 'Added student successfully',
      };
    }
  } catch (error) {
    console.error('Error adding Student', error);
    response = {
      status: 400, // Internal Server Error
      message: 'Adding student failed',
    };
  }
  return response;
};

export async function supabaseUpdateStudent(course: Course, userDetails: any): Promise<any> {
  let response: ResponseData;

  try {
    const { data, error: updateError } = await db
      .from('students')
      .update({
        avatar: userDetails.user_metadata.avatar_url,
        full_name: userDetails.user_metadata.full_name,
        email: userDetails.user_metadata.email || "",
        page_active: await updatePageActive("id", "students", userDetails.user_metadata.user_name, 1),
        date_last_accessed: new Date().toISOString(),
        page_loads: await updatePageLoads("id", "students", userDetails.user_metadata.user_name, 1),
      }).eq('id', userDetails.user_metadata.user_name);

      if (data) supabaseStudents.update(cur => [...cur, data[0]]);
      if (updateError) {
        console.error('Error updating Student:', updateError);
        response = {
          status: 400, // Internal Server Error
          message: 'Updating student failed: ',
        };
      } else {
        response = {
          status: 204, // No Content (Success)
          message: 'Updating student successfully',
        };
      }
    } catch (error) {
      console.error('Error updating Student', error);
      response = {
        status: 400, // Internal Server Error
        message: 'Updating student failed',
      };
    }
    return response;
};

/*********************************************
 * *********** Learning Object Functions *************
 */

export const updateStudentCourseLoTable = async (courseId: string, studentId: string, loId: any): Promise<any> => {
  console.log("Updating student-course-interaction table...", loId);
  try {
    await db
      .from('student-course-interaction')
      .insert({
        course_id: courseId,
        student_id: studentId,
        lo_id: loId,
        page_active: await updatePageActive("lo_id", "student-course-interaction", loId, 1),
        date_last_accessed: new Date().toISOString(),
        page_loads: await updatePageLoads("lo_id", "student-course-interaction", loId, 1),
      });
  } catch (error) {
    console.error(error);
  }
};

export const supabaseUpdateLastAccessNonCourse = async (key: string, id: string, title: string, table: any): Promise<any> => {
  try {
    const { error: updateError } = await db
      .from(table)
      .update({
        date_last_accessed: new Date().toISOString(),
        title: title
      })
      .eq(key, id);
  } catch (error) {
    console.log(error);
  }
};

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
    console.error('UpdateLastAccess error: '+ error);
  }
  console.log(`Date updated successfully for key ${key}. New date: ${new Date().toISOString()}`);
};

// Function to update count for a specific key
export async function addLo(course: Course, currentLo: any): Promise<ResponseData> {
  let response: ResponseData;
  console.log("Adding Lo...", currentLo);
  console.log("Adding course Lo...", course);

  try {
    const { error: updateError } = await db
      .from('learning-object')
      .insert({
        id: currentLo.loRoute ?? currentLo.route,
        type: currentLo.type,
        name: currentLo.courseTitle,
        date_last_accessed: new Date().toISOString(),
        lo_img: currentLo.img
      });
    if (updateError) {
      console.error('Error adding learning object:', updateError);
      response = {
        status: 400, // Internal Server Error
        message: 'Adding learning object failed: ',
      };
    } else {
      response = {
        status: 201, // No Content (Success)
        message: 'Adding learning object successfully',
      };
      console.log(`Learning object successfully added for ${currentLo.loRoute}`);
    }
  } catch (error) {
    console.error('Error adding learning object:', error);
    response = {
      status: 400, // Internal Server Error
      message: 'Adding learning object failed',
    };
  }
  return response;
};

export async function updateLo(course: Course, currentLo: any): Promise<any> {
  let response: ResponseData;

  console.log("Updating Learnin object...", currentLo);
  try {
    const { data, error } = await db
      .from('learning-object')
      .update({
        type: currentLo.type,
        name: currentLo.courseTitle,
        date_last_accessed: new Date().toISOString(),
        lo_img: currentLo.img
      }).eq('id', currentLo.loRoute);

    if (error) {
      console.error('Error adding learning object:', error);
      response = {
        status: 400, // Internal Server Error
        message: 'Adding course failed: ',
      };
    } else {
      response = {
        status: 201, // No Content (Success)
        message: 'Added course successfully',
      };
      console.log(`Learning object successfully updated for ${currentLo.loRoute}`);
    }
  } catch (error) {
    console.error('Error adding learning object:', error);
    response = {
      status: 400, // Internal Server Error
      message: 'Adding course failed',
    };
  }
  return response;
};

export async function updatePageActive(key: string, table: string, id: any, incrementBy: number) {
  try {

    const { data, error } = await db
      .from(table)
      .select('page_active')
      .eq(key, id)
      .single();

    let currentCount: number = 0;

    currentCount = data?.page_active || 0;


    const newCount = currentCount + incrementBy;

    // Update the database with the new count
    await db
      .from(table)
      .update({ 'page_active': newCount })
      .eq(key, id);

    console.log(`How long the page is active is updated successfully for key ${id}. New count: ${newCount}`);
  } catch (error: any) {
    console.error(`Error updating how long the page is active for ${table}: ${error.message}`);
  }
};

export async function updatePageLoads(key: string, table: string, id: any, incrementBy: number) {
  try {

    const { data, error } = await db
      .from(table)
      .select('page_loads')
      .eq(key, id)
      .single();

    let currentCount: number = 0;

    currentCount = data?.page_loads || 0;


    const newCount = currentCount + incrementBy;

    // Update the database with the new count
    await db
      .from(table)
      .update({ 'page_loads': newCount })
      .eq(key, id);

    console.log(`How many times the page was loaded successfully for key ${id}. New count: ${newCount}`);
  } catch (error: any) {
    console.error(`Error updating count for table ${table}: ${error.message}`);
  }
};

export const supabaseService = {
  currentUserId: "",

  async storeLoEvent(course: Course, currentLo: any, onlineStatus: boolean, userDetails: any) {
    try {
      console.log("Current Lo data store", course);

      const returnedObject = await db.from("learning-object").select().eq("id", currentLo.route);
      //const returnedInteractionInfo = await getUserCourses(course.courseId, userDetails.id, currentLo.route);
      //if (returnedInteractionInfo) return;
      console.log("Inside storeToCourseLo", returnedObject);

      if (returnedObject.data === null || returnedObject.data.length === 0) {
        console.log("inserting into learning-object...");
        const successAddLo: ResponseData = await addLo(course, currentLo);

        console.log("successAddLo", successAddLo);
        // Check if the addLo function was successful
        if (successAddLo.status === 201) {
          console.log("updating Student Course Interaction...");
          await updateStudentCourseLoTable(course.courseId, userDetails.id, currentLo.route);
        }
      } else {
        console.log("updating learning-object...");
        const successUpdateLo: ResponseData = await updateLo(course, currentLo);

        // Check if the updateLo function was successful
        if (successUpdateLo?.status === 204) {
          console.log("updating Student Course Interaction...");
          await updateStudentCourseLoTable(course.courseId, userDetails.id, currentLo.route);
        }
      }
    } catch (error) {
      console.error("storeLoEvent: ", error);
    }
  },

  async storeToCourseUsers(course: Course, userDetails: any) {
    try {
      if (userDetails.fullName === "Anon") return;
      let returnedStudent = await getUsers(userDetails.user_metadata.user_name);

      if (returnedStudent === undefined || returnedStudent.length === 0) {
        console.log("inserting into students...", userDetails)
        const successAddStudent: ResponseData = await supabaseAddStudent(course, userDetails);
        if (successAddStudent.status === 201) {
          console.log("updating Student Course Interaction...");
          await updateStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, null);
        }
      } else {
        console.log("update students...", userDetails)
        const successUpdateStudent: ResponseData = await supabaseUpdateStudent(course, userDetails)
        if (successUpdateStudent?.status === 204) {
          console.log("updating Student Course Interaction...");
          await updateStudentCourseLoTable(course.courseId, userDetails.user_metadata.user_name, null);
        }
      }
    } catch (error) {
      console.error("Student Course Interaction Table error: ", error);
    }
  },

  async storeCourseUsersLoToSupababse(course: Course, lo: Lo, onlineStatus: boolean, userDetails: any) {
    try {
      if (userDetails.fullName === "Anon") return;

      let returnedCourses = await getCourses(course.courseId);
      console.log("returnedCourses", returnedCourses);
      if (returnedCourses === null || returnedCourses.length === 0) {
        await addCourse(course);
        await this.storeToCourseUsers(course, userDetails);
        await this.storeLoEvent(course, lo, onlineStatus, userDetails);
        console.log("Added courses for: " + course.courseId + " and " + userDetails.id + " and " + lo.route);
      } else {
        console.log("update storeCourseUsersLoToSupababse...")
        await updateCourse(course);
        await this.storeToCourseUsers(course, userDetails);
        await this.storeLoEvent(course, lo, onlineStatus, userDetails);
        console.log("Updated courses for: " + course.courseId + " and " + userDetails.id + " and " + lo.route);
      }
    } catch (error) {
      console.error("storeCourseUsersLoToSupababse: ", error);
    }
  },

  async storeToSupabaseCourse(course: any) {
    try {
      let returnedCourses = await getCourses(course.courseId);
      if (returnedCourses === null || returnedCourses.length === 0) {
        await addCourse(course);
      } else {
        console.log("update...")
        await updateCourse(course);
      }

    } catch (error) {
      console.error("StoreToSupabaseCourse error: ", error);
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



