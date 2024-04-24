<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Topic } from "$lib/services/models/lo-types";
  import { TopicSheet } from "$lib/services/sheets/next-analytics/topic-sheet";

  export let userMap: Map<string, UserMetric>;
  export let topics: Topic[] = [];

  let topicSheet = new TopicSheet(topics, userMap);

  onMount(() => {
    topicSheet.populateUsersData();
    //combined
    renderChart();
  });

  // Destroy the chart instance when the component unmounts
  onDestroy(() => {
    if (topicSheet) {
      // Clean up resources if needed
      topicSheet = null;
    }
  });

  // Re-render the chart when the tab regains focus
  const handleFocus = () => {
    renderChart();
  };

// Function to render the chart
const renderChart = () => {
    if (topicSheet) {
      const container = topicSheet.getChartContainer();
      topicSheet.renderChart(container);

    //combined
    const combinedTopicData = topicSheet.prepareCombinedTopicData(userMap);
    topicSheet.renderCombinedTopicChart(document.getElementById("combined-heatmap"), combinedTopicData, "Total Time: Topics");
    }
  };

  // Listen for window focus event to trigger chart refresh
  window.addEventListener("focus", handleFocus);
</script>

<div class="h-screen flex flex-col">
  <div id="heatmap-container" class="h-1/2 w-full overflow-y-scroll"></div>
  <div id="combined-heatmap" class="h-1/2 w-full overflow-y-scroll"></div>
</div>
