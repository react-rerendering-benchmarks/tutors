import { getKeys } from "$lib/environment";
import { courseService } from "$lib/services/course";
import type { Course } from "$lib/services/models/lo-types";
import { initFirebase } from "$lib/services/utils/firebase";
import type { PageLoad } from "./$types";
import { presenceService } from "./presence-engine";
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit";
import type { Database } from "../DatabaseDefinitions";

// export const load: PageLoad = async ({ params, fetch }) => {
//   initFirebase(getKeys().firebase);
//   const course: Course = await courseService.readCourse(params.courseid, fetch);
//   presenceService.initService(course);
//   return {
//     course: course
//   };

  export const load: PageLoad = async ({ params, fetch, data, depends }) => {
    depends("supabase:auth");
  
    const supabase = createSupabaseLoadClient<Database>({
      supabaseUrl: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
      event: { fetch },
     serverSession: data.session
    });

    const course: Course = await courseService.readCourse(params.courseid, fetch);
    presenceService.initService(course, supabase);

    const {
      data: { session }
    } = await supabase.auth.getSession();
  
    // return { supabase, session };
    return {
          course: course,
          supabase: supabase,
          session: session
        };
  };



//};
