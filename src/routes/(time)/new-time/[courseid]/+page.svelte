<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { writable, type Writable } from "svelte/store";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import LabTime from "$lib/ui/time/LabTime.svelte";
  import TopicTime from "$lib/ui/time/TopicTime.svelte";
  import InstructorLabTime from "$lib/ui/time/InstructorLabTime.svelte";
  import InstructorCalendarTime from "$lib/ui/time/InstructorCalendarTime.svelte";
  import CalendarTime from "$lib/ui/time/CalendarTime.svelte";
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
        <Tab bind:group={tabSet} name="calendar" value={0}>Calendar</Tab>
        <Tab bind:group={tabSet} name="calendar" value={1}>Calendar (new chart)</Tab>
      {/if}
      <Tab bind:group={tabSet} name="labs" value={2}>Labs</Tab>
      <Tab bind:group={tabSet} name="labs-chart" value={3}>Labs (chart)</Tab>
      <Tab bind:group={tabSet} name="labs-chart" value={4}>Labs (new chart)</Tab>
      <Tab bind:group={tabSet} name="topics" value={5}>Topics</Tab>
      <Tab bind:group={tabSet} name="topics-chart" value={6}>Topics (chart)</Tab>
      <Tab bind:group={tabSet} name="topics-chart" value={7}>Topics (new chart)</Tab>
      <Tab bind:group={tabSet} name="activities" value={8}>All Activity</Tab>
    {:else}
      {#if data.course?.hasCalendar}
        <Tab bind:group={tabSet} name="calendar-all" value={9}>Calendar</Tab>
        <Tab bind:group={tabSet} name="calendar-all" value={10}>Calendar (new chart)</Tab>
      {/if}
      {#if data.course?.hasEnrollment}
        <Tab bind:group={tabSet} name="LabsAllStudent" value={11}>Labs (enrolled)</Tab>
      {/if}
      <Tab bind:group={tabSet} name="LabsAllStudent" value={12}>New Labs(all)</Tab>
      <Tab bind:group={tabSet} name="LabsAllStudent" value={13}>Labs(all)</Tab>

      <Tab bind:group={tabSet} name="allLabsChart" value={14}>Labs(all chart)</Tab>
      <Tab bind:group={tabSet} name="allLabsBoxPlot" value={15}>Labs(Box Plot)</Tab>

    {/if}
  </TabGroup>
  {#if tabSet === 0}
    {#if data.course?.hasCalendar}
      <CalendarTime user={data.user} calendarData={data.calendar} />
    {/if}
  {:else if tabSet === 1}
    <CalendarTimeNewChart user={data.user} calendarData={data.calendar} />
  {:else if tabSet === 2}
    <LabTime user={data.user} allLabs={data.allLabs} chart={false} />
  {:else if tabSet === 3}
    <LabTime user={data.user} allLabs={data.allLabs} chart={true} />
  {:else if tabSet === 4}
    <LabTimeNewChart user={data.user} allLabs={data.allLabs} chart={true} />
  {:else if tabSet === 5}
    <TopicTime user={data.user} allTopics={data.allTopics} chart={false} />
  {:else if tabSet === 6}
    <TopicTime user={data.user} allTopics={data.allTopics} chart={true} />
  {:else if tabSet === 7}
    <TopicTimeNewChart user={data.user} allTopics={data.allTopics} chart={true} />
  {:else if tabSet === 8}
    <AllActivityTime user={data.user} allActivities={data.allActivities} chart={false} />
  {:else if tabSet === 9}
    {#if data.course?.hasEnrollment}
      <InstructorCalendarTime userMap={data.enrolledUsers} calendarData={data.calendar} />
    {:else}
      <InstructorCalendarTime userMap={data.users} calendarData={data.calendar} />
    {/if}
  {:else if tabSet === 10}
    <NewInstructorCalendarTime userMap={data.enrolledUsers} />
  {:else if tabSet === 11}
    <InstructorLabTime userMap={data.enrolledUsers} allLabs={data.allLabs} chart={false} />
    {:else if tabSet === 12}
    <NewInstructorLabTime userMap={data.enrolledUsers} allLabs={data.allLabs} />
  {:else if tabSet === 13}
    <InstructorLabTime userMap={data.users} allLabs={data.allLabs} chart={false} />
  {:else if tabSet === 14}
    <InstructorLabTime userMap={data.enrolledUsers} allLabs={data.allLabs} chart={true} />
    {:else if tabSet === 15}
    <BoxPlotInstructorChart userMap={data.enrolledUsers} allLabs={data.allLabs} chart={true} />
  {/if}
</div>
