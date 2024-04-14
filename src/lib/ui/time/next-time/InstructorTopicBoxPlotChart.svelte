<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import { TopicBoxPlot } from "$lib/services/sheets/next-analytics/topic-box-plot";
  import type { Lo, Topic } from "$lib/services/models/lo-types";

  export let userMap: Map<string, UserMetric>;
  export let topics: Topic[] = [];

  let topicBoxPlot = new TopicBoxPlot();

  onMount(() => {
    const { boxplotData, userNicknames } = topicBoxPlot.prepareBoxplotData(userMap);
    topicBoxPlot.renderBoxPlot(document.getElementById("heatmap-container"), boxplotData, userNicknames);
    const combinedBoxplotData = topicBoxPlot.prepareCombinedBoxplotData(userMap);
     topicBoxPlot.renderCombinedBoxplotChart(document.getElementById('combinedBoxPlot'), combinedBoxplotData);
  });
</script>

<div class="h-screen">
    <div id={"heatmap-container"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
    <div id={"combinedBoxPlot"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
</div>
