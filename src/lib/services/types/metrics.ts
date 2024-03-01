import type { Topic } from "$lib/services/models/lo-types";
import type { Token, User } from "./auth";
import type { IconType } from "$lib/services/models/lo-types";
import type { Lo } from "$lib/services/models/lo-types";

export interface Metric {
  id: string;
  title: string;
  count: number;
  last: string;
  duration: number;
  metrics: Metric[];
}

export interface DayMeasure {
  date: string;
  dateObj: number;
  metric: number;
}

// export interface UserMetric extends Token {
//   title: string;
//   count: number;
//   last: string;
//   duration: number;
//   calendar_id: Date;
//   metrics: Metric[];
//   labActivity: Metric[];
//   calendarActivity: DayMeasure[];
// }

export interface UserMetric extends Token {
  title: string;
  count: number;
  last: string;
  name: string;
  email: string;
  picture: string;
  onlinestatus: boolean;
  nickname: string;
  duration: number;
  calendar_id: Date;
  routes: { [key: string]: string[] };
  allRoutes: string[];
  metric: Metric;
  metrics: Metric[];
  labActivity: Metric[];
  calendarActivity: DayMeasure[];
  topicActivity: Metric[];
}

export interface StudentMetric {
  name: string;
  img: string;
  nickname: string;
  topic: Topic;
  lab: Lo;
  time: number;
}

export interface StudentLoEvent {
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentImg: string;
  courseTitle: string;
  loTitle: string;
  loImage: string;
  loRoute: string;
  loIcon?: IconType;
  timeout: number;
}

export interface TopicData {
  calendar_id: string;
  title: string;
  total_duration: number;
  metrics: Metric[];
}

// Function to aggregate durations for parent topics and their children
export interface AggregatedTopicData {
  total_duration: number;
  title: string;
  calendar_id: string;
}

export interface TopicPaths {
  [parentTopic: string]: string[];
}

export type StudentLoUpdate = (kind: string, event: StudentLoEvent) => void;

export type MetricUpdate = (user: User, topic: Topic, lab: Lo, time: number) => void;
export type MetricDelete = (user: User) => void;
export type StatusChange = (user: User) => void;
export type refreshStudents = (students: StudentMetric[]) => void;
