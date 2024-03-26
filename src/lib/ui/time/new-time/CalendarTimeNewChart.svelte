<script lang="ts">
  import { onMount } from "svelte";
  import { CalendarSheet } from "$lib/services/sheets/new-analytics/calendar-sheet";
  import type { UserMetric } from "$lib/services/types/metrics";

  export let user: UserMetric;
  let calendarSheet = new CalendarSheet();

  onMount(() => {
    calendarSheet.populateUserData(user); 
    calendarSheet.renderChart(user);
  });
</script>

<div class="h-screen">
  <div id={`chart-${user.nickname}`} style="height: 100%"></div>
</div>
