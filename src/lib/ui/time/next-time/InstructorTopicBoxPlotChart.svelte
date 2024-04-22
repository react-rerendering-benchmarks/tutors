<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import { TopicBoxPlot } from "$lib/services/sheets/next-analytics/topic-box-plot";
  import type { Lo, Topic } from "$lib/services/models/lo-types";

  export let userMap: Map<string, UserMetric>;
  export let topics: Topic[] = [];

  let topicBoxPlot: TopicBoxPlot;

  // Initialize the charts and render them when the component mounts
  onMount(() => {
    topicBoxPlot = new TopicBoxPlot();
    renderCharts();
  });

  // Destroy the chart instances when the component unmounts
  onDestroy(() => {
    if (topicBoxPlot) {
      // Clean up resources if needed
      // For example: topicBoxPlot.destroy();
      topicBoxPlot = null;
    }
  });

  // Re-render the charts when the tab regains focus
  const handleFocus = () => {
    renderCharts();
  };

  // Function to render the charts
  const renderCharts = () => {
    if (topicBoxPlot) {
      const { boxplotData, userNicknames } = topicBoxPlot.prepareBoxplotData(userMap);
      topicBoxPlot.renderBoxPlot(document.getElementById("heatmap-container"), boxplotData, userNicknames);
      const combinedBoxplotData = topicBoxPlot.prepareCombinedBoxplotData(userMap);
      topicBoxPlot.renderCombinedBoxplotChart(document.getElementById('combinedBoxPlot'), combinedBoxplotData);
    }
  };

  // Listen for window focus event to trigger chart refresh
  window.addEventListener('focus', handleFocus);
</script>

<div class="h-screen">
    <div id="heatmap-container" style="height: 50%; width:100%; overflow-y: scroll;"></div>
    <div id="combinedBoxPlot" style="height: 50%; width:100%; overflow-y: scroll;"></div>
</div>

