<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import { LabSheet } from "$lib/services/sheets/new-analytics/lab-sheet";

  export let userMap: Map<string, UserMetric>;
  export let allLabs: Lo[] = [];

  let labSheet = new LabSheet(allLabs, userMap);

  onMount(() => {
    // Array.from(userMap.values()).forEach((user) => {
    labSheet.populateUsersData(userMap);
    // });
  });
</script>

<div class="h-screen">
  {#each Array.from(userMap.keys()) as userId}
    <!-- <div id={`chart-${userId}`} style="height: 100%; width:100%"></div> -->
    <div id={"heatmap-container"} style="height: 100%; width:100%"></div>
  {/each}
</div>
