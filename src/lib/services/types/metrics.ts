import type { Topic } from "$lib/services/models/lo-types";
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

export interface UserSummary {
  picture: string;
  name: string;
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

export interface UserMetric{
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
  metric: Metric;
  metrics: RouteTitleDuration[];
  topics: CompositeData[];
  detailedLabInfo: CompositeData[];
  labActivity: RouteTitleDuration[];
  calendarActivity: DayMeasure[];
  topicActivity: RouteTitleDuration[];
}

export interface StudentsInteraction extends student, course{
  topics: CompositeData[];
  detailedLabInfo: CompositeData[];
  labActivity: RouteTitleDuration[];
  calendarActivity: DayMeasure[];
  topicActivity: RouteTitleDuration[];
}

export interface student{
  name: string;
  email: string;
  picture: string;
  onlinestatus: boolean;
  nickname: string;
}

export interface course{
  title: string;
  last: string;
  duration: string;
  count: number;
}

export interface CompositeData {
  calendar_id: string;
  title: string;
  lo_title: string;
  total_duration: number;
  lab_title: string;
}

export interface RouteTitleDuration {
  route: string | undefined;
  title: string | null;
  duration: number;
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

export type StudentLoUpdate = (kind: string, event: StudentLoEvent) => void;

export type MetricUpdate = (user: User, topic: Topic, lab: Lo, time: number) => void;
export type MetricDelete = (user: User) => void;
export type StatusChange = (user: User) => void;
export type refreshStudents = (students: StudentMetric[]) => void;
