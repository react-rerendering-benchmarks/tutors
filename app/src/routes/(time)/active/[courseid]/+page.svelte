<script lang="ts">
  import { studentsOnlineList } from "./stores";
  import StudentCard from "./StudentCard.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { analyticsService } from "$lib/services/analytics";
  import { initFirebase } from "$lib/services/utils/firebase";
  import { presenceService } from "./presence-engine";
  import { getKeys } from "$lib/environment";
  import Composite from "$lib/ui/learning-objects/structure/Composite.svelte";

  export let data: any;

  $: ({ supabase, session } = data);

  onMount(async () => {
    console.log("onMount", data);
    if (data.course.authLevel > 0) {
      console.log("auth");
      if (!session) {
        console.log("no session");
        localStorage.setItem("course_url", data.course.courseUrl);
        localStorage.setItem("isAuthenticating", "true");
        goto("/auth");
      } else {
        console.log("session");
        //session.onlineStatus = await analyticsService.getOnlineStatus(data.course, session);
        session.onlineStatus = await analyticsService.getOnlineStatusSupabase(data.course, session, supabase);

        // analyticsService.updateLogin(data.course.courseId, data.session);
      }
    }
    console.log("initSupabaseService onMount function", data);

    presenceService.initSupabaseService(data.course, data);

    // if (getKeys().firebase.apiKey !== "XXX") {
    //   initFirebase(getKeys().firebase);
    // }
  });
</script>

<div class="bg-surface-100-800-token mx-auto mb-2 place-items-center overflow-hidden rounded-xl p-4">
  <div class="flex flex-wrap justify-center">
    {#each $studentsOnlineList as studentLo}
      <StudentCard lo={studentLo} session={session} supabase={supabase}/>
    {/each}
  </div>
</div>
