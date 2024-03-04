<script lang="ts">
    import { onMount } from "svelte";
    import { Grid } from "ag-grid-community";
    import "ag-grid-enterprise";
    import type { UserMetric } from "$lib/services/types/metrics";
    import { AllActivityCountSheet } from "../../services/sheets/all-activity-count-sheet";
    import { options } from "../../services/sheets/topic-sheet";
  
    export let chart = false;
    export let user: UserMetric;
    export let allActivities: any[] = [];
    let time: any;
    let timeGrid;
    let timeSheet = new AllActivityCountSheet();
  
    onMount(async () => {
      timeGrid = new Grid(time, { ...options });
      if (allActivities.length > 0) {
        timeSheet.populateCols(allActivities);
        timeSheet.populateRow(user, allActivities);
        timeSheet.render(timeGrid);
        if (chart) timeSheet.chart(timeGrid, "groupedBar");
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