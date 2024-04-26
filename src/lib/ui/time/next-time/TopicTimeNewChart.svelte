<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Topic } from "$lib/services/models/lo-types";
  import { TopicCountSheet } from "../../../services/sheets/next-analytics/topic-count-sheet";

  export let user: UserMetric;
  export let topics: Topic[] = [];
  let topicPieSheet = new TopicCountSheet(user);

  onMount(async () => {
    if (topics.length > 0) {
        topicPieSheet.populateUserData(user);
        topicPieSheet.renderChart();
      }
  });

  const renderChart = () => {
    if (topicPieSheet && user) {
      topicPieSheet.renderChart();
    }
  };

  window.addEventListener("focus", renderChart);
</script>

<div class="h-screen">
  <div id="chart" style="height: 100%; width:100%"></div>
</div>
