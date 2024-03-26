<script lang="ts">
  import { onMount } from "svelte";
  import { CalendarSheet } from "$lib/services/sheets/new-analytics/calendar-sheet";
  import type { UserMetric } from "$lib/services/types/metrics";

  export let userMap: Map<string, UserMetric>;

  let calendarSheet = new CalendarSheet();

  onMount(() => {
    Array.from(userMap.values()).forEach((user) => {
      calendarSheet.renderChart(user);
    });
  });
</script>

<div class="h-screen">
  {#each Array.from(userMap.keys()) as userId}
    <div id={`chart-${userId}`} style="height: 50%; width:100%"></div>
  {/each}
</div>
