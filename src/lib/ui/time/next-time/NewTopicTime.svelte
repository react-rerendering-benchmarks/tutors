<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { UserMetric } from "$lib/services/types/metrics";
    import type {  Topic } from "$lib/services/models/lo-types";
    import { TopicSheet } from "$lib/services/sheets/next-analytics/topic-sheet";

    export let user: UserMetric;
    export let topics: Topic[] = [];

    let topicSheet: TopicSheet;
  
    onMount(() => {
      topicSheet = new TopicSheet(topics, user);
      renderChart();
    });

    onDestroy(() => {
      if (topicSheet) {
        topicSheet = null;
      }
    });

    const renderChart = () => {
      if (topicSheet && user) {
        topicSheet.populateSingleUserData(user);

      }
    };

    window.addEventListener('focus', renderChart);
  </script>
  
  <div class="h-screen">
      <div id={"heatmap-container"} style="height: 100%; width:100%"></div>
  </div>

  