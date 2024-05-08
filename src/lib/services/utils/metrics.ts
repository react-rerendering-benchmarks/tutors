import { child, get, getDatabase, ref } from "firebase/database";
import type { DayMeasure, Metric, UserMetric } from "$lib/services/types/metrics";
import type { Lo } from "$lib/services/models/lo-types";
import { db } from "$lib/db/client";
import { getAllCalendarData } from "./supabase";

function populateCalendar(user: UserMetric) {
  user.calendarActivity = [];
  const calendar = user.metrics.find((e) => e.id === "calendar");
  if (calendar) {
    for (const [key, value] of Object.entries(calendar)) {
      if (key.startsWith("20")) {
        const dayMeasure: DayMeasure = {
          date: key,
          dateObj: Date.parse(key),
          metric: value
        };
        user.calendarActivity.push(dayMeasure);
      }
    }
  }
}

function populateLabUsage(user: UserMetric, allLabs: Lo[]) {
  user.labActivity = [];
  for (const lab of allLabs) {
    const labActivity = findInUser(lab.title, user);
    user.labActivity.push(labActivity);
  }
}

function findInUser(title: string, metric: UserMetric) {
  return findInMetrics(title, metric.metrics);
}

function findInMetrics(title: string, metrics: Metric[]): Metric {
  let result: Metric = null;
  for (const metric of metrics) {
    if (metric.id === "ab" || metric.id === "alk" || metric.id === "ideo") {
      // console.log("ignoring spurious data"); as result of bug in types
      // since fixed, but bad data in some user dbs.
    } else {
      result = findInMetric(title, metric);
      if (result != null) {
        return result;
      }
    }
  }
  return result;
}

function findInMetric(title: string, metric: Metric) {
  if (title === metric.title) {
    return metric;
  } else if (metric.metrics.length > 0) {
    return findInMetrics(title, metric.metrics);
  } else {
    return null;
  }
}

function expandGenericMetrics(id: string, fbData): any {
  const metric = {
    id: "",
    metrics: []
  };
  metric.id = id;
  if (fbData) {
    Object.entries(fbData).forEach(([key, value]) => {
      if (typeof value === "object") {
        metric.metrics.push(expandGenericMetrics(key, value));
      } else {
        metric[key] = value;
      }
    });
  }
  return metric;
}

export async function fetchUserById(courseUrl: string, session: any, allLabs) {
  const courseBase = courseUrl.substr(0, courseUrl.indexOf("."));
  const userEmail = session.user.user_metadata.email;
  // eslint-disable-next-line no-useless-escape
  const userEmailSanitised = userEmail.replace(/[`#$.\[\]\/]/gi, "*");
  let user = null;
  const dbRef = ref(getDatabase());
  try {
    const snapshot = await get(child(dbRef, `${courseBase}/users/${userEmailSanitised}`));
    if (snapshot.exists()) {
      user = expandGenericMetrics("root", snapshot.val());
      populateCalendar(user);
      if (allLabs) {
        populateLabUsage(user, allLabs);
      }
    }
  } catch (error) {
    console.log("db error");
  }
  return user;
}

export async function fetchAllUsers(courseUrl: string, allLabs): Promise<Map<string, UserMetric>> {
  const courseBase = courseUrl.substr(0, courseUrl.indexOf("."));
  const users = new Map<string, UserMetric>();

  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, `${courseBase}`));
  if (snapshot.exists()) {
    const genericMetrics = expandGenericMetrics("root", snapshot.val());

    for (const userMetric of genericMetrics.metrics[1].metrics) {
      if (userMetric.nickname) {
        const user = {
          userId: userMetric.id,
          email: userMetric.email,
          name: userMetric.name,
          picture: userMetric.picture,
          nickname: userMetric.nickname,
          onlineStatus: userMetric.onlineStatus,
          id: "home",
          title: userMetric.title,
          count: userMetric.count,
          last: userMetric.last,
          duration: userMetric.duration,
          metrics: userMetric.metrics,
          labActivity: [],
          calendarActivity: []
        };
        if (user.onlineStatus == undefined) {
          user.onlineStatus = "online";
        }
        populateCalendar(user);
        if (allLabs) {
          populateLabUsage(user, allLabs);
        }
        users.set(user.nickname, user);
      }
    }
  }
  return users;
}

export function toHoursAndMinutes(totalMinutes: number): string {
  let str = "";
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    hours = hours % 24;
    str += `${days}:`;
  }
  if (hours > 0) {
    str += `${hours}:`;
  }
  str += `${minutes}`;
  return str;
}

export function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear().toString();
  let month = (d.getMonth() + 1).toString();
  let day = d.getDate().toString();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
}

/*****Supabase ********/
export async function fetchStudentById(courseUrl: string, session: any, allLabs, allTopics): Promise<UserMetric|null> {
  let user = null;
  const courseBase = courseUrl.substring(0, courseUrl.indexOf("."));
    const { data: student, error: studentError } = await db.rpc('fetch_course_overview_for_student', {
      user_name: session.user.user_metadata.user_name,
      course_base: courseBase
    });

    if (studentError) {
      throw studentError;
    }

    user = student[0];
if(user) {
    await updateStudentMetrics(courseBase, user);
    populateStudentCalendar(courseBase, user);
    if (allLabs) {
      populateDetailedLabInfo(courseBase, user);
      populateStudentsLabUsage(user, allLabs);
    }

    if (allTopics) {
      await populateTopics(courseBase, user);
      await updateStudentMetricsTopicData(courseBase, user);

      user.metric.metrics.forEach(item1 => {
        allTopics.forEach(item2 => {
          if (item2.route.includes(item1.route)) {
            item1.title = item2.title;
          }
        });
      });
      populateStudentsTopicUsage(user, allTopics);
    }
    return user;
  }else{
    return null;
  }
  
};

export async function fetchAllStudents(courseUrl: string, allLabs, allTopics): Promise<Map<string, UserMetric>> {
  let user = null;
  const users = new Map<string, UserMetric>();
  try {
    const courseBase = courseUrl.substring(0, courseUrl.indexOf("."));
    const { data: students, error: studentsError } = await db.rpc('fetch_course_overview_for_students', {
      course_base: courseBase
    });

    if (studentsError) {
      throw studentsError;
    }

    for (const student of students) {
      user = student;
      await updateStudentMetrics(courseBase, user);
      populateStudentCalendar(courseBase, user);
      if (allLabs) {
        populateDetailedLabInfo(courseBase, user);
        populateStudentsLabUsage(user, allLabs);
      }

      if (allTopics) {
        await populateTopics(courseBase, user);
        await updateStudentMetricsTopicData(courseBase, user);
      }
      user.metric.metrics.forEach(item1 => {
        allTopics.forEach(item2 => {
          if (item2.route.includes(item1.route)) {
            item1.title = item2.title;
          }
        });
      });
      populateStudentsTopicUsage(user, allTopics);
      users.set(user.nickname, user);

    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
  return users;
};

async function updateStudentMetrics(courseBase: string, user: any) {
  const { data: metrics, error: metricsError } = await db.rpc('get_lab_data', {
    user_name: user.nickname,
    course_base: courseBase
  });

  if (metricsError) {
    throw metricsError;
  }

  user.metric = {
    id: 'lab',
    metrics: []
  };

  metrics.forEach((m) => {
    const metricObject: { [key: string]: number | string | undefined } = {};
    metricObject['route'] = m.lochild ? removeTrailingSlash(m.lochild) : undefined;
    metricObject['count'] = m.count;

    user.metric.metrics.push(metricObject);
  });
}

async function updateStudentMetricsTopicData(courseBase: string, user: any) {
  const { data: metrics, error: metricsError } = await db.rpc('get_topic_data', {
    user_name: user.nickname,
    course_base: courseBase
  });

  if (metricsError) {
    throw metricsError;
  }

  user.metric = {
    id: 'topic',
    metrics: []
  };

  metrics.forEach((m) => {
    const metricObject: { [key: string]: number | string | undefined } = {};
    metricObject['route'] = m.loparent ? removeTrailingSlash(m.loparent) : undefined;
    metricObject['count'] = m.count;

    user.metric.metrics.push(metricObject);
  });
}

async function populateStudentCalendar(courseId: string, user: UserMetric) {
  user.calendarActivity = [];
  let data = await getAllCalendarData(courseId, user.nickname)
  if (data) {
    data.forEach(item => {
      const calendarId = item.id;
      const dayMeasure: DayMeasure = {
        date: calendarId,
        dateObj: Date.parse(calendarId),
        metric: item.duration,
      };
      user.calendarActivity.push(dayMeasure);
    });
  }
}

async function populateStudentsLabUsage(user: UserMetric, allLabs: Lo[]) {
  user.labActivity = [];
  for (const lab of allLabs) {
    const labActivity = findInStudent(lab.route, user);
    if (labActivity !== null) {
      labActivity.title = lab.title;
      user.labActivity.push(labActivity);
    }
  }
}

function findInStudent(title: string, user: any) {
  return findInStudentMetrics(title, user.metric.metrics);
}

function findInStudentMetric(title: string, metric: any) {
  if (title === metric.route) {
    return metric;
  } else if (metric.metrics?.length > 0 || metric.metrics?.count > 0) {
    return findInStudentMetrics(title, metric.metrics);
  } else {
    return null;
  }
}

function findInStudentMetrics(title: string, calendar: any): Metric {
  let result: any = null;
  for (const metric of calendar) {
    if (metric.id === "ab" || metric.id === "alk" || metric.id === "ideo") {
      // console.log("ignoring spurious data"); as result of bug in types
      // since fixed, but bad data in some user dbs.
    } else {
      result = findInStudentMetric(title, metric);
      if (result != null) {
        return result;
      }
    }
  }
  return result;
}

async function populateStudentsTopicUsage(user: UserMetric, allTopics: Lo[]) {
  user.topicActivity = [];
  for (const topic of allTopics) {
    const topicActivity: Metric = findInStudent(topic.route, user);
    if (topicActivity !== null) {
      topicActivity.title = topic.title;
      user.topicActivity.push(topicActivity);
    }
  }
}

function removeTrailingSlash(str: string): string {
  return str.replace(/\/$/, '');
};

async function populateTopics(courseBase: string, user: UserMetric) {
  const { data: topics, error: topicsError } = await db.rpc('get_topic_metrics_for_student', {
    user_name: user.nickname,
    course_base: courseBase
  });

  if (topicsError) {
    throw topicsError;
  }

  user.topics = topics;
};

async function populateDetailedLabInfo(courseBase: string, user: UserMetric) {
  const { data: detailedLabInfo, error: detailedLabInfoError } = await db.rpc('get_lab_usage', {
    user_name: user.nickname,
    course_base: courseBase
  });

  if (detailedLabInfoError) {
    throw detailedLabInfoError;
  }
  user.detailedLabInfo = detailedLabInfo;
}
