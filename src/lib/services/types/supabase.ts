
export interface SupabaseStudent {
    id: string;
    email: string;
    nickName: string;
    avtar: string;
    title: string;
    duration: number;
    count: number;
    dateLastAccessed: Date;
  }
  
  export interface SupabaseLearningObject {
    id: string;
    learningObjectType: string;
    name: string;
    duration: number;
    count: number;
    dateLastAccessed: Date;
  }

  export interface SupabaseCourse {
    courseId: string;
    duration: number;
    count: number;
    dateLastAccessed: Date;
  }

