<script lang="ts">
  import { onMount } from "svelte";
  import { Grid } from "ag-grid-community";
  import "ag-grid-enterprise";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Lo } from "$lib/services/models/lo-types";
  import { LabCountSheet } from "../../../services/sheets/new-analytics/lab-count-sheet";

  export let user: UserMetric;
  export let allLabs: Lo[] = [];
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
  <div id={`chart-${user.nickname}`} style="height: 100%"></div>
</div>
