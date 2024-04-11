<script lang="ts">
  import { onMount } from "svelte";
  import { LiveStudentFeedSheet } from "$lib/services/sheets/next-analytics/live-student-feed";
  import type { UserMetric } from "$lib/services/types/metrics";
  export let userMap: Map<string, UserMetric>;
  export let courseName: string;

  let liveStudentFeedSheet: LiveStudentFeedSheet;

  onMount(() => {
    liveStudentFeedSheet = new LiveStudentFeedSheet(Array.from(userMap.values()), courseName);
    liveStudentFeedSheet.renderCharts();
  });
</script>

<div class="h-screen">
  <div id="loadingIndicator" style="display: none;">Loading...</div>
  <div id="heatmap-container" style="height: 50%; width:100%; overflow-y: scroll;"></div>
</div>
