<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Lo, Topic } from "$lib/services/models/lo-types";
  import { TopicCountSheet } from "../../../services/sheets/next-analytics/topic-count-sheet";

  export let user: UserMetric;
  export let topics: Topic[] = [];
  let timeSheet = new TopicCountSheet();

  onMount(async () => {
    if (topics.length > 0) {
      if (!timeSheet.chartRendered) {
        timeSheet.populateUserData(user);
        timeSheet.renderChart();
        timeSheet.chartRendered = true;
      }
    }
  });
</script>

<div class="h-screen">
    <div id="chart" class="ag-theme-balham h-5/6" />
</div>


