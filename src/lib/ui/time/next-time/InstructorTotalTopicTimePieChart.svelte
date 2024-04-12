<script lang="ts">
  import { onMount } from "svelte";
  import { TopicCountSheet } from "$lib/services/sheets/next-analytics/topic-count-sheet";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Topic } from "$lib/services/models/lo-types";

  export let userMap: Map<string, UserMetric>;
  export const topics: Topic[] = [];

  let topicCountSheet = new TopicCountSheet();

  onMount(() => {
    topicCountSheet.populateUsersData(userMap);
    topicCountSheet.renderChart();
    topicCountSheet.chartRendered = true;
      
    
  });
</script>

<div class="h-screen">
  <div id="chart" class="ag-theme-balham h-5/6" />
</div>
