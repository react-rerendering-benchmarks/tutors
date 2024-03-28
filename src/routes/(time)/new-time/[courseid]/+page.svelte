<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { writable, type Writable } from "svelte/store";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import TopicTime from "$lib/ui/time/TopicTime.svelte";
  import InstructorLabTime from "$lib/ui/time/new-time/InstructorLabTime.svelte";
  import InstructorCalendarTime from "$lib/ui/time/InstructorCalendarTime.svelte";
  import AllActivityTime from "$lib/ui/time/AllActivityTime.svelte";
  import TopicTimeNewChart from "$lib/ui/time/new-time/TopicTimeNewChart.svelte";
  import LabTimeNewChart from "$lib/ui/time/new-time/LabTimeNewChart.svelte";
  import CalendarTimeNewChart from "$lib/ui/time/new-time/CalendarTimeNewChart.svelte";
  import NewInstructorCalendarTime from "$lib/ui/time/new-time/NewInstructorCalendarTime.svelte";
  import NewInstructorLabTime from "$lib/ui/time/new-time/NewInstructorLabTime.svelte"; 
  import BoxPlotInstructorChart from "$lib/ui/time/new-time/BoxPlotInstructorChart.svelte";

  export let data: any;

  const storeTab: Writable<string> = writable("Labs");
  let pinBuffer = "";
  let instructorMode = false;
  let tabSet = 0;

  onMount(async () => {
    window.addEventListener("keydown", keypressInput);
    if (!data.course?.hasCalendar) {
      tabSet = 1;
    }
  });

  function keypressInput(e: KeyboardEvent) {
    pinBuffer = pinBuffer.concat(e.key);
    if (pinBuffer === data.ignorePin) {
      instructorMode = true;
      tabSet = 4;
      if (!data.course?.hasCalendar) {
        tabSet = 5;
      }
    }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css" />
</svelte:head>

<div in:fade={{ duration: 500 }} class="bg-base-200 mt-3">
  <TabGroup selected={storeTab}>
    {#if !instructorMode}
      {#if data.course?.hasCalendar}
        <Tab bind:group={tabSet} name="calendar" value={0}>Calendar (new chart)</Tab>
      {/if}
      <Tab bind:group={tabSet} name="labs-chart" value={1}>Labs (new chart)</Tab>
      <Tab bind:group={tabSet} name="topics" value={2}>Topics</Tab>
      <Tab bind:group={tabSet} name="topics-chart" value={3}>Topics (chart)</Tab>
      <Tab bind:group={tabSet} name="topics-chart" value={4}>Topics (new chart)</Tab>
      <Tab bind:group={tabSet} name="activities" value={5}>All Activity</Tab>
    {:else}
      {#if data.course?.hasCalendar}
        <Tab bind:group={tabSet} name="calendar-all" value={6}>Calendar (new chart)</Tab>
      {/if}
      {#if data.course?.hasEnrollment}
        <Tab bind:group={tabSet} name="LabsAllStudent" value={7}>Labs (enrolled)</Tab>
      {/if}
      <Tab bind:group={tabSet} name="LabsAllStudent" value={8}>New Labs(all)</Tab>
      <Tab bind:group={tabSet} name="LabsAllStudent" value={9}>Labs(all)</Tab>

      <Tab bind:group={tabSet} name="allLabsChart" value={10}>Labs(all chart)</Tab>
      <Tab bind:group={tabSet} name="allLabsBoxPlot" value={11}>Labs(Box Plot)</Tab>

    {/if}
  </TabGroup>
  {#if tabSet === 0}
  {#if data.course?.hasCalendar}
    <CalendarTimeNewChart user={data.user} />
  {/if}
  {:else if tabSet === 1}
    <LabTimeNewChart user={data.user} allLabs={data.allLabs} chart={true} />
  {:else if tabSet === 2}
    <TopicTime user={data.user} allTopics={data.allTopics} chart={false} />
  {:else if tabSet === 3}
    <TopicTime user={data.user} allTopics={data.allTopics} chart={true} />
  {:else if tabSet === 4}
    <TopicTimeNewChart user={data.user} allTopics={data.allTopics} chart={true} />
  {:else if tabSet === 5}
    <AllActivityTime user={data.user} allActivities={data.allActivities} chart={false} />
  {:else if tabSet === 6}
    {#if data.course?.hasEnrollment}
      <InstructorCalendarTime userMap={data.enrolledUsers} calendarData={data.calendar} />
    {:else}
      <InstructorCalendarTime userMap={data.users} calendarData={data.calendar} />
    {/if}
  {:else if tabSet === 7}
    <NewInstructorCalendarTime userMap={data.enrolledUsers} />
  {:else if tabSet === 8}
    <InstructorLabTime userMap={data.enrolledUsers} allLabs={data.allLabs} chart={false} />
    {:else if tabSet === 9}
    <NewInstructorLabTime userMap={data.enrolledUsers} allLabs={data.allLabs} />
  {:else if tabSet === 10}
    <InstructorLabTime userMap={data.users} allLabs={data.allLabs} chart={false} />
  {:else if tabSet === 11}
    <InstructorLabTime userMap={data.enrolledUsers} allLabs={data.allLabs} chart={true} />
    {:else if tabSet === 12}
    <BoxPlotInstructorChart userMap={data.enrolledUsers} allLabs={data.allLabs} />
  {/if}
</div>
