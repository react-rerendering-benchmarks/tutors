<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import { LabSheet } from "$lib/services/sheets/next-analytics/lab-sheet";
  import type { Lo } from "$lib/services/models/lo-types";

  export let userMap: Map<string, UserMetric>;
  export let allLabs: Lo[] = [];

  let labSheet = new LabSheet(allLabs, userMap);

  onMount(() => {
    labSheet.populateUsersData(userMap);

    const combinedLabData = labSheet.prepareCombinedLabData(userMap);
    labSheet.renderCombinedBoxplotChart(document.getElementById('combined-heatmap'), combinedLabData);
});

</script>

<div class="h-screen">
    <div id={"heatmap-container"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
    <div id={"combined-heatmap"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
</div>
