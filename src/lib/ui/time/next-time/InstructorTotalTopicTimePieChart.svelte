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
    renderCharts();
  });

   // Destroy the chart instances when the component unmounts
   onDestroy(() => {
    if (topicCountSheet) {
      // Clean up resources if needed
      topicCountSheet = null;
    }
  });

  const renderCharts = () => {
    if (topicCountSheet) {
      topicCountSheet.populateUsersData(userMap);
      topicCountSheet.renderChart();
    }
  };

  // Re-render the charts when the tab regains focus
  const handleFocus = () => {
    renderCharts();
  };

  window.addEventListener('focus', handleFocus);
</script>

<div class="h-screen">
  <div id="chart" class="ag-theme-balham h-5/6" />
</div>
