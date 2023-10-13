import { getKeys } from "$lib/environment";
import { courseService } from "$lib/services/course";
import type { Course } from "$lib/services/models/lo-types";
import { initFirebase } from "$lib/services/utils/firebase";
import type { PageLoad } from "./$types";
import { presenceService } from "./presence-engine";
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit";
import type { Database } from "../DatabaseDefinitions";
import { currentLo } from "$lib/stores";
import { studentsOnline, studentsOnlineList } from "./stores";
import type { User, UserSummary } from "$lib/services/types/auth";
import type { StudentLoEvent } from "$lib/services/types/metrics";
import type { SupabaseClient } from "@supabase/supabase-js";

// export const load: PageLoad = async ({ params, fetch }) => {
//   initFirebase(getKeys().firebase);
//   const course: Course = await courseService.readCourse(params.courseid, fetch);
//   presenceService.initService(course);
//   return {
//     course: course
//   };

export const ssr = false;

export const load = async ({ params, parent, fetch }) => {
  
  const course = await courseService.readCourse(params.courseid, fetch);

  const data = await parent();

  if (!data.session) {
    currentLo.set(course);
    return {
      course,
      lo: course
    };
  }

  if (data.session) {
    console.log("data session: +", data.session)

    console.log("initSupabaseService being called");
  presenceService.initSupabaseService(course, data);

  return {
    course: course
  };
  // const { data: userCourseList } = await data.supabase.from("all-course-access").select("course_info").eq("id", data.session.user.id);
  // console.log(userCourseList);
  }
  //   if (!userCourseList || userCourseList.length === 0) {
  //     await data.supabase.from("all-course-access").insert([
  //       {
  //         id: data.session.user.id,
  //         course_info: {
  //           courses: [
  //             {
  //               id: course.courseId,
  //               name: course.title,
  //               last_accessed: new Date().toISOString(),
  //               visits: 1
  //             }
  //           ]
  //         }
  //       }
  //     ]);
  //   } else {
  //     const courseList = userCourseList[0].course_list;

  //     const courseIndex = courseList.courses.findIndex((c) => c.id === course.courseId);

  //     if (courseIndex === -1) {
  //       courseList.courses.push({
  //         id: course.courseId,
  //         name: course.title,
  //         last_accessed: new Date().toISOString(),
  //         visits: 1
  //       });
  //     } else {
  //       courseList.courses[courseIndex].last_accessed = new Date().toISOString();
  //       courseList.courses[courseIndex].visits++;
  //     }

  //     await data.supabase.from("all-course-info").update({ course_info: courseList }).eq("id", data.session.user.id);
  //   }
  // }

  // currentLo.set(course);

  // return {
  //   course,
  //   lo: course
  // };
};



//};
