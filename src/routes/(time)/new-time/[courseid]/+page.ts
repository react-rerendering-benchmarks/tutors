import type { PageLoad } from "./$types";
import { courseService } from "$lib/services/course";
import { fetchStudentById } from "$lib/services/utils/metrics";
import type { Course } from "$lib/services/models/lo-types";
import type { UserMetric } from "$lib/services/types/metrics";


export const ssr = false;

const isStringArray = (test: any[]): boolean => {
  return Array.isArray(test) && !test.some((value) => typeof value !== "string");
};

export const load: PageLoad = async ({ parent, params, fetch }) => {
  const data = await parent();

  if (data.session) {
    const course: Course = await courseService.readCourse(params.courseid, fetch);
    const allLabs = course.wallMap?.get("lab");
    //const user: UserMetric = await fetchUserById(params.courseid, data.session, allLabs);
     const user: UserMetric = await fetchStudentById(params.courseid, data.session, allLabs);
    // const users: Map<string, UserMetric> = await fetchAllUsers(params.courseid, allLabs);
    // const enrolledUsers: Map<string, UserMetric> = new Map<string, UserMetric>();
    // if (course.hasEnrollment && course.enrollment) {
    //   for (let i = 0; i < course.enrollment.length; i++) {
    //     const enrolledUser = users.get(course.enrollment[i]);
    //     if (enrolledUser) {
    //       if (!enrolledUser.name) {
    //         const response = await fetch(`https://api.github.com/users/${enrolledUser.nickname}`);
    //         const latestProfile = await response.json();
    //         if (latestProfile.name) {
    //           enrolledUser.name = latestProfile.name;
    //         } else {
    //           enrolledUser.name = latestProfile.login;
    //         }
    //       }
    //       enrolledUsers.set(course.enrollment[i], enrolledUser);
    //     }
    //   }
    // }
    return {
      user: user,
      course: course,
      allLabs: course.wallMap?.get("lab"),
      calendar: course.courseCalendar,
      ignorePin: course.ignorePin,
      //users: users,
      //enrolledUsers
    };
  }
};
