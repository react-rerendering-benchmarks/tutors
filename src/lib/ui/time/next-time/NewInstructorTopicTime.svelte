<script lang="ts">
  import { onMount } from "svelte";
  import type { UserMetric } from "$lib/services/types/metrics";
  import type { Topic } from "$lib/services/models/lo-types";
  import { TopicSheet } from "$lib/services/sheets/next-analytics/topic-sheet";

  export let userMap: Map<string, UserMetric>;
  export let topics: Topic[] = [];

  const topicSheet = new TopicSheet(topics, userMap);

  onMount(() => {
    topicSheet.populateUsersData();
    //combined
    const combinedTopicData = topicSheet.prepareCombinedTopicData(userMap);
    topicSheet.renderCombinedTopicChart(document.getElementById("combined-heatmap"), combinedTopicData, "Total Time: Topics");
  });
</script>

<div class="h-screen">
  <div id={"heatmap-container"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
  <div id={"combined-heatmap"} style="height: 50%; width:100%; overflow-y: scroll;"></div>
</div>
