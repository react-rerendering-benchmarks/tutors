<script lang="ts">
    import { onMount } from "svelte";
    import type { UserMetric } from "$lib/services/types/metrics";
    import type {  Topic } from "$lib/services/models/lo-types";
    import { TopicSheet } from "$lib/services/sheets/next-analytics/topic-sheet";
  
    export let user: UserMetric;
    export let topics: Topic[] = [];
  
    const topicSheet = new TopicSheet(topics, user);
  
    onMount(() => {
      topicSheet.populateSingleUserData(user);
    });
  </script>
  
  <div class="h-screen">
      <div id={"heatmap-container"} style="height: 100%; width:100%"></div>
  </div>

  