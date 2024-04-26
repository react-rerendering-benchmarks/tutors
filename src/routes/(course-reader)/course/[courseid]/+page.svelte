<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { firebaseAnalyticsService } from "$lib/services/firebaseAnalytics";
  import { supabaseAnalyticsService } from "$lib/services/supabaseAnalytics";  
  import { initFirebase } from "$lib/services/utils/firebase";
  import { getKeys } from "$lib/environment";
  import Composite from "$lib/ui/learning-objects/structure/Composite.svelte";

  export let data: any;

  $: ({ supabase, session } = data);

  onMount(async () => {
    if (data.course.authLevel > 0) {
      if (!session) {
        localStorage.setItem("course_url", data.course.courseUrl);
        localStorage.setItem("isAuthenticating", "true");
        goto("/auth");
      } else {
        session.onlineStatus = await firebaseAnalyticsService.getOnlineStatus(data.course, session);
        firebaseAnalyticsService.updateLogin(data.course.courseId, data.session);
        session.onlineStatus = await supabaseAnalyticsService.getOnlineStatus(data.course, session);
        supabaseAnalyticsService.updateLogin(data.session);
      }
    }

    if (getKeys().firebase.apiKey !== "XXX") {
      initFirebase(getKeys().firebase);
    }
  });
</script>

<Composite composite={data.course} />
