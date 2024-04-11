<script lang="ts">
  import { onMount } from "svelte";
  import { CalendarSheet } from "$lib/services/sheets/next-analytics/calendar-sheet";
  import type { UserMetric } from "$lib/services/types/metrics";

  export let userMap: Map<string, UserMetric>;

  let calendarSheet = new CalendarSheet();

  onMount(() => {
    Array.from(userMap.values()).forEach((user) => {
      calendarSheet.createChartContainer(user.nickname);
      calendarSheet.renderChart(user);
    });
  });

  // Calculate the height of each chart container dynamically
  $: chartHeight = userMap && userMap.size > 0 ? (100 / userMap.size) + '%' : '50%';
</script>

<div class="h-screen overflow-auto">
  {#if userMap}
    {#each Array.from(userMap?.keys()) as userId}
      <div id={`chart-${userId}`} style={`height: 50%; width:100%;overflow-y: scroll;`}></div>
    {/each}
  {:else}
    <div id="heatmap-container" style="height: ${chartHeight}; width:100%;"></div>
  {/if}
</div>

