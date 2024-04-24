<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { TopicCountSheet } from "$lib/services/sheets/next-analytics/topic-count-sheet";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Topic } from "$lib/services/models/lo-types";

  export let userMap: Map<string, UserMetric>;
  export const topics: Topic[] = [];

  let topicCountSheet: TopicCountSheet;

  onMount(() => {
    topicCountSheet = new TopicCountSheet();
    topicCountSheet.populateUsersData(userMap);
    renderChart();
  });

   // Destroy the chart instances when the component unmounts
   onDestroy(() => {
    if (topicCountSheet) {
      // Clean up resources if needed
      topicCountSheet = null;
    }
  });

  const renderChart = () => {
    if (topicCountSheet) {
      topicCountSheet.renderChart();
    }
  };

  onDestroy(() => {
      if (topicCountSheet) {
        topicCountSheet = null;
      }
    });

  window.addEventListener("focus", renderChart);
</script>

<div class="h-screen">
  <div id={"chart"} style="height: 100%; width:100%"></div>
</div>
