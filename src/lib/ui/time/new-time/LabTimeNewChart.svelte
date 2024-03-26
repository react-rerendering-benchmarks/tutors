<script lang="ts">
  import { onMount } from "svelte";
  import { Grid } from "ag-grid-community";
  import "ag-grid-enterprise";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Lo } from "$lib/services/models/lo-types";
  //import { LabCountSheet } from "../../services/sheets/lab-count-sheet";
  import { LabCountSheet } from "../../../services/sheets/new-analytics/lab-count-sheet";
  import { options } from "../../../services/sheets/lab-sheet";
  import Lab from "../../learning-objects/content/Lab.svelte";

  export let chart = false;
  export let user: UserMetric;
  export let allLabs: Lo[] = [];
  let time: any;
  let timeGrid;
  let timeSheet = new LabCountSheet();

  onMount(async () => {
      // Ensure the chart is rendered only when it's not already rendered
      if (!timeSheet.chartRendered) {
        timeSheet.populateCols(allLabs);
        timeSheet.populateUserData(user);
        timeSheet.renderChart();
        timeSheet.chartRendered = true;
      }
  });
</script>

<div class="h-screen">
  {#if chart}
    <div id="chart" class="ag-theme-balham h-5/6" />
    <div bind:this={time} class="ag-theme-balham" />
  {:else}
    <div bind:this={time} class="ag-theme-balham h-5/6" />
  {/if}
</div>
