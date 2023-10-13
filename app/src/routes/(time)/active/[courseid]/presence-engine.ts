import { child, get, getDatabase, onValue, ref, off } from "firebase/database";
import { studentsOnline, studentsOnlineList } from "./stores";
import type { Course } from "$lib/services/models/lo-types";
import type { User, UserSummary } from "$lib/services/types/auth";
import type { StudentLoEvent } from "$lib/services/types/metrics";
import type { SupabaseClient } from "@supabase/supabase-js";
import { currentLo } from "$lib/stores";
import { title } from "process";

let canUpdate = false;

export const presenceService = {
  db: {},
  user: <User>{},
  userSummaryCache: new Map<string, UserSummary>(),
  course: <Course>{},
  lastCourse: <Course>{},
  students: new Map<string, StudentLoEvent>(),
  los: new Array<StudentLoEvent>(),

  sweepAndPurge(): void {
    console.log("Sweep and Purge");
    const losToDelete: StudentLoEvent[] = [];
    this.los.forEach((lo) => {
      lo.timeout--;
      if (lo.timeout === 0) {
        losToDelete.push(lo);
      }
    });
    losToDelete.forEach((lo) => {
      const index = this.los.indexOf(lo);
      if (index !== -1) {
        this.los.splice(index, 1);
      }
      this.students.delete(lo.studentId);
    });

    studentsOnlineList.set([...this.los]);
    studentsOnline.set(this.los.length);
  },

  async visitUpdate(courseId: string) {
    const lo = await (await get(child(ref(this.db), `all-course-access/${courseId}/learningEvent`))).val();
    if (lo && lo.user && lo.user.fullName != "anonymous") {
      const event: StudentLoEvent = {
        studentName: lo.user.fullName,
        studentId: lo.user.id,
        studentEmail: lo.user.studentEmail,
        studentImg: lo.user.avatar,
        courseTitle: lo.courseTitle,
        loTitle: lo.title,
        loImage: lo.img,
        loRoute: lo.subRoute,
        loIcon: lo.icon,
        timeout: 7
      };
      const studentUpdate = this.students.get(event.studentId);
      if (!studentUpdate) {
        this.students.set(event.studentId, event);
        this.los.push(event);
      } else {
        studentUpdate.loTitle = event.loTitle;
        studentUpdate.loImage = event.loImage;
        studentUpdate.loRoute = event.loRoute;
        studentUpdate.loIcon = event.loIcon;
        studentUpdate.timeout = 7;
      }
      studentsOnlineList.set([...this.los]);
      studentsOnline.set(this.los.length);
    }
  },

  initService(course: Course) {
    this.db = getDatabase();
    setInterval(this.sweepAndPurge.bind(this), 1000 * 60);
    studentsOnline.set(0);
    studentsOnlineList.set([]);
    canUpdate = false;
    setTimeout(function () {
      canUpdate = true;
    }, 5000);
    // @ts-ignore
    console.log("statusRef");
    let statusRef = ref(this.db, `all-course-access/${course.courseId}/visits`);

    onValue(statusRef, async () => {
      if (canUpdate) {
        console.log("visit update");
        await this.visitUpdate(course.courseId);
      }
    });
    // @ts-ignore
    statusRef = ref(this.db, `all-course-access/${course.courseId}/count`);
    onValue(statusRef, async () => {
      if (canUpdate) {
        await this.visitUpdate(course.courseId);
      }
    });
  },
  /**
   * Supabase is being populated in the same structure as Firebase
   * But will be stored in JSON form 
   */
  async initSupabaseService(course: Course, data: any) {
    setInterval(this.sweepAndPurge.bind(this), 1000 * 60);
    studentsOnline.set(0);
    studentsOnlineList.set([]);
    canUpdate = false;
    setTimeout(function () {
      canUpdate = true;
    }, 5000);
    console.log("data: ", data);
    if (data.session) {
      const learnObj = await data.supabase.from("all-course-access").select(`course_info`).eq("id", data.session.user.id);
      const lo = learnObj?.data[0]?.course_info?.[course.title];
      console.log("lo: ", lo);
      if (learnObj.data.length > 0) {
        const event: StudentLoEvent = {
          studentName: lo.user.fullName,
          studentId: lo.user.id,
          studentEmail: lo.user.studentEmail,
          studentImg: lo.user.avatar,
          courseTitle: lo.learningEvent.course_title,
          loTitle: lo.learningEvent.title,
          loImage: lo.learningEvent.img,
          loRoute: lo.learningEvent.subRoute,
          loIcon: lo.learningEvent.icon,
          timeout: 7
        };
        console.log("id: ", event);
        const studentUpdate = this.students.get(event.studentId);
        if (!studentUpdate) {
          this.students.set(event.studentId, event);
          this.los.push(event);
        } else {
          studentUpdate.loTitle = event.loTitle;
          studentUpdate.loImage = event.loImage;
          studentUpdate.loRoute = event.loRoute;
          studentUpdate.loIcon = event.loIcon;
          studentUpdate.timeout = 7;
        }
        studentsOnlineList.set([...this.los]);
        studentsOnline.set(this.los.length);
      }
      // }
       const { data: courseInfo } = await data.supabase.from("all-course-access").select(`course_info`).eq("id", data.session.user.id);
       /**
        * THIS COSE BELOW COMMENTED OUT IS ANOTHER VARIATION ON HOW SUPABASE ALLOWS  YOU TO MANIPULATE JSON DATA ON THE FLY
        */
      //const { data: userCourseList, error } = await data.supabase.from("all-course-access").select(`id`);
  //     const { data: courseInfo, error } = await data.supabase.from('all-course-access').select(`
  //   id,
  //   visits:  course_info->visits,
  //   last:        course_info->last,
  //   course_title:      course_info->learningEvent->course_title
  // `)


      console.log("courseInfo", courseInfo);
      console.log("student-id", data.session.user.id)

      console.log("Course", course);
      if (!courseInfo || courseInfo.length === 0 || courseInfo === null) {
        await data.supabase.from("all-course-access").insert([
          {
            id: data.session.user.id,
            course_info: {
              [course.title]: {
                count: 1,
                last: new Date().toISOString(),
                learningEvent: {
                  course_title: course.title,
                  img: course.los[0].img,
                  isPrivate: course.hide ? course.hide: 0,
                  subRoute: course.los[0].route,
                  title: course.los[0].title
                },
                user: {
                  avatar: data.session.user.user_metadata.avatar_url,
                  fullName: data.session.user.user_metadata.name,
                  id: data.session.user.user_metadata.id,
                  studentEmail: data.session.user.user_metadata.studentEmail
                }, 
                lo: {
                  courseTitle: course.title,
                  icon: {
                    color: course.icon?.color,
                    type: course.icon?.type
                  },
                  img: course.img,
                  isPrivate: course.hide ? course.hide: 0,
                  subRoute: course.route,
                  title: course.title,
                  tutorsTimeid: data.session.user.user_metadata.id,
                },
                title: course.title,
                visits: 1
              }
            },
          }
        ]);
      } else {
        const courseList = courseInfo[0].course_info;

        // const courseIndex = courseList.id.findIndex((c) => 
        // c.id === data.session.user.id);

        if (courseList[course.title]=== course.title) {
          console.log("courseList", courseList[course.title]);
          courseList.metadata.push({
            id: data.session.user.id,
            course_info: {
              [course.title]: {
                count: 1,
                last: new Date().toISOString(),
                learningEvent: {
                  course_title: course.title,
                  img: course.los[0].img,
                  isPrivate: course.hide ? course.hide: 0,
                  subRoute: course.los[0].route,
                  title: course.title
                },
                user: {
                  avatar: data.session.user.user_metadata.avatar_url,
                  fullName: data.session.user_metadata.name ? data.session.user_metadata.name : data.session.user_metadata.email,
                  id: data.session.user.id,
                  studentEmail: data.session.user_metadata.email
                },
                lo: {
                  courseTitle: course.title,
                  icon: {
                    color: course.icon?.color,
                    type: course.icon?.type
                  },
                  img: course.img,
                  isPrivate: course.hide ? course.hide: 0,
                  subRoute: course.route,
                  title: course.courseUrl,
                  tutorsTimeid: data.session.user.user_metadata.id,

                },
                title: course.title,
                visits: 1
              }
            },
          }
          );
          console.log("pushing...", courseList);
        } else {
          console.log("updating...", courseList)

          courseList[course.title].last = new Date().toISOString();
          courseList[course.title].learningEvent.course_title = course.title; 
          courseList[course.title].learningEvent.img = course.los[0].img;
          courseList[course.title].learningEvent.isPrivate = course.hide ? course.hide : 0;
          courseList[course.title].learningEvent.subRoute = course.los[0].route;
          courseList[course.title].visits++;
          courseList[course.title].count++;

          console.log("updating...");
        }
        console.log("new courseList", courseList)
        await data.supabase.from("all-course-access").update({ course_info: courseList }).eq("id", data.session.user.id);
        console.log("updated")
      }
    }

    currentLo.set(course);
  
    console.log("course End", course);
    return {
      course,
      lo: course
    };
  }
};