<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import { LabSheet } from "$lib/services/sheets/next-analytics/lab-sheet";
    import type { Topic } from "$lib/services/models/lo-types";
    import { TopicSheet } from "$lib/services/sheets/next-analytics/topic-sheet";

  export let userMap: Map<string, UserMetric>;
  export let topics: Topic[] = [];

  let topicSheet = new TopicSheet(topics, userMap);

  onMount(() => {
    topicSheet.populateUsersData(userMap);
   //combined
   const combinedLabData = topicSheet.prepareCombinedLabData(userMap);
   topicSheet.renderCombinedTopicChart(document.getElementById('combined-heatmap'), combinedLabData, "Total Time: Topics");
  });
</script>

<div class="h-screen">
    <div id={"heatmap-container"} style="height: 100%; width:100%; overflow-y: scroll;"></div>
    <div id={"combined-heatmap"} style="height: 100%; width:100%; overflow-y: scroll;"></div>
</div>

