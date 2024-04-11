<script lang="ts">
    import { onMount } from "svelte";
    import type { UserMetric } from "$lib/services/types/metrics";
    import { LabSheet } from "$lib/services/sheets/next-analytics/lab-sheet";
    import type { Lo } from "$lib/services/models/lo-types";
  
    export let user: UserMetric;
    export let allLabs: Lo[] = [];
  
    const labSheet = new LabSheet(allLabs, user);
  
    onMount(() => {
      labSheet.populateSingleUserData(user);
    });
  </script>
  
  <div class="h-screen">
      <div id={"heatmap-container"} style="height: 100%; width:100%"></div>
  </div>

