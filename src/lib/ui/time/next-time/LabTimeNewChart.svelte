<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Lo } from "$lib/services/models/lo-types";
  import { LabCountSheet } from "../../../services/sheets/next-analytics/lab-count-sheet";

  export let user: UserMetric;
  export let allLabs: Lo[] = [];
  let timeSheet = new LabCountSheet();

  onMount(async () => {
    timeSheet.populateCols(allLabs);
    timeSheet.populateUserData(user);
    timeSheet.renderChart();
  });
</script>

<div class="h-screen">
  {#if user}
    <div id={`chart-${user?.nickname}`} style="height: 100%"></div>
  {:else}
    <div id={`chart`} style="height: 100%"></div>
  {/if}
</div>
