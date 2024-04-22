<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { CalendarSheet } from "$lib/services/sheets/next-analytics/calendar-sheet";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Calendar } from "$lib/services/models/lo-types";

  export let user: UserMetric;
  export let calendarData: Calendar;

  let calendarSheet: CalendarSheet;

  // Initialize the chart and render it when the component mounts
  onMount(() => {
    calendarSheet = new CalendarSheet();
    renderChart();
  });

  // Destroy the chart instance when the component unmounts
  onDestroy(() => {
    if (calendarSheet) {
      // Clean up resources if needed
      // For example: calendarSheet.destroy();
      calendarSheet = null;
    }
  });

  // Re-render the chart when the tab regains focus
  const handleFocus = () => {
    renderChart();
  };

  // Function to render the chart
  const renderChart = () => {
    if (calendarSheet && user) {
      calendarSheet.createChartContainer(user.nickname);
      calendarSheet.renderChart(user);
    }
  };

  // Listen for window focus event to trigger chart refresh
  window.addEventListener('focus', handleFocus);
</script>

<div class="h-screen">
  {#if user}
    <div id={`chart-${user?.nickname}`} style="height: 100%;"></div>
  {:else}
    <div id="heatmap-container" style="height: 100%"></div>
  {/if}
</div>

