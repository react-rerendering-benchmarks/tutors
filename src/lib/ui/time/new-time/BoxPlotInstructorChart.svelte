<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import { LabBoxPlot } from "$lib/services/sheets/new-analytics/lab-box-plot";
  import type { Lo } from "$lib/services/models/lo-types";

  export let userMap: Map<string, UserMetric>;
  export let allLabs: Lo[] = [];

  let labBoxPlot = new LabBoxPlot();

  onMount(() => {
    const { boxplotData, userNicknames } = labBoxPlot.prepareBoxplotData(userMap);
    labBoxPlot.renderBoxPlot(document.getElementById("heatmap-container"), boxplotData, userNicknames);
    const combinedBoxplotData = labBoxPlot.prepareCombinedBoxplotData(userMap);
     labBoxPlot.renderCombinedBoxplotChart(document.getElementById('combinedBoxPlot'), combinedBoxplotData);
  });
</script>

<div class="h-screen">
    <div id={"heatmap-container"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
    <div id={"combinedBoxPlot"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
</div>
