
export interface SupabaseStudent {
    id: string;
    email: string;
    nickName: string;
    avtar: string;
    title: string;
    pageActive: number;
    pageLoads: number;
    dateLastAccessed: Date;
  }
  
  export interface SupabaseLearningObject {
    id: string;
    learningObjectType: string;
    name: string;
    pageActive: number;
    pageLoads: number;
    dateLastAccessed: Date;
  }

  export interface SupabaseCourse {
    courseId: string;
    pageActive: number;
    pageLoads: number;
    dateLastAccessed: Date;
  }

