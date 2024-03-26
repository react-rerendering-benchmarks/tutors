<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Lo, Topic } from "$lib/services/models/lo-types";
  import { TopicCountSheet } from "../../../services/sheets/new-analytics/topic-count-sheet";

  export let chart = false;
  export let user: UserMetric;
  export let allTopics: Lo[] = [];
  let time: any;
  let timeSheet = new TopicCountSheet();

  onMount(async () => {
    if (allTopics.length > 0) {
      if (!timeSheet.chartRendered) {
        timeSheet.populateUserData(user);
        timeSheet.renderChart();
        timeSheet.chartRendered = true;
      }
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
