<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { LabHeatMapChart } from "../analytics/heatmap/lab-heat-map-chart";
  import { TopicHeatMapChart } from "../analytics/heatmap/topic-heat-map-chart";
  import type { Course } from "$lib/services/models/lo-types";
  import type { Session } from "@supabase/supabase-js";

  export let course: Course;
  export let session: Session;
  export let userIds: string[] = [];
  export let userNamesUseridsMap: Map<string, string> = new Map();
  export let multipleUsers: boolean = false;
  export let chartType: "LabHeatMap" | "TopicHeatMap";

  let chartInstance: LabHeatMapChart | TopicHeatMapChart | null = null;

  onMount(() => {
    if (chartType === "LabHeatMap") {
      chartInstance = new LabHeatMapChart(course, session, userIds, userNamesUseridsMap, multipleUsers);
    } else if (chartType === "TopicHeatMap") {
      chartInstance = new TopicHeatMapChart(course, session, userIds, userNamesUseridsMap, multipleUsers);
    } else {
      throw new Error(`Invalid chart type: ${chartType}`);
    }
    if (multipleUsers) {
      //combined
      const element = document.getElementById("combined-heatmap");
      if (!element) {
        throw new Error("Element with ID 'combined-heatmap' not found");
      }
      chartInstance.renderChart(element!);
    }

    chartInstance.populateAndRenderData();
  });

  onDestroy(() => {
    if (chartInstance) {
      chartInstance = null;
    }
  });

  window.addEventListener("focus", () => {
    if (chartInstance) {
      const container = document.getElementById("heatmap-container");
      chartInstance.renderChart(container!);
    }
  });
</script>

<div class="h-screen flex flex-col">
  {#if multipleUsers}
    <div id="heatmap-container" class="h-2/3 w-full overflow-y-scroll"></div>
    <div id="combined-heatmap" class="h-1/3 w-full overflow-y-scroll"></div>
  {:else}
    <div id="heatmap-container" class="h-full w-full overflow-y-scroll"></div>
  {/if}
</div>
