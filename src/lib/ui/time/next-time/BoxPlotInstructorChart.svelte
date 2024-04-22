<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import { LabBoxPlot } from "$lib/services/sheets/next-analytics/lab-box-plot";
  import type { Lo } from "$lib/services/models/lo-types";

  export let userMap: Map<string, UserMetric>;
  export let allLabs: Lo[] = [];

  let labBoxPlot: LabBoxPlot;

  onMount(() => {
    labBoxPlot = new LabBoxPlot();
    renderCharts();
  });

  // Destroy the chart instances when the component unmounts
  onDestroy(() => {
    if (labBoxPlot) {
      // Clean up resources if needed
      // For example: labBoxPlot.destroy();
      labBoxPlot = null;
    }
  });

  // Re-render the charts when the tab regains focus
  const handleFocus = () => {
    renderCharts();
  };

  // Function to render the charts
  const renderCharts = () => {
    if (labBoxPlot) {
      const { boxplotData, userNicknames } = labBoxPlot.prepareBoxplotData(userMap);
      labBoxPlot.renderBoxPlot(document.getElementById("heatmap-container"), boxplotData, userNicknames);
      const combinedBoxplotData = labBoxPlot.prepareCombinedBoxplotData(userMap);
      labBoxPlot.renderCombinedBoxplotChart(document.getElementById('combinedBoxPlot'), combinedBoxplotData);
    }
  };

  // Listen for window focus event to trigger chart refresh
  window.addEventListener('focus', handleFocus);
</script>

<div class="h-screen">
    <div id="heatmap-container" style="height: 50%; width:100%; overflow-y: scroll;"></div>
    <div id="combinedBoxPlot" style="height: 50%; width:100%; overflow-y: scroll;"></div>
</div>

