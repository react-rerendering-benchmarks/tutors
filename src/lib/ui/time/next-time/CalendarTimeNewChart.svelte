<script lang="ts">
  import { onMount } from "svelte";
  import { CalendarSheet } from "$lib/services/sheets/next-analytics/calendar-sheet";
  import type { UserMetric } from "$lib/services/types/metrics";
    import type { Calendar } from "$lib/services/models/lo-types";

  export let user: UserMetric;
  export let calendarData: Calendar;

  let calendarSheet = new CalendarSheet();

  onMount(() => {
    calendarSheet.createChartContainer(user?.nickname);
    calendarSheet.renderChart(user);
  });
</script>

<div class="h-screen">
  {#if user}
  <div id={`chart-${user?.nickname}`} style="height: 100%; "></div>
  {:else}
    <div id="heatmap-container" style="height: 100%"></div>
  {/if}
</div>
