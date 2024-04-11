<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { writable, type Writable } from "svelte/store";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import AllActivityTime from "$lib/ui/time/AllActivityTime.svelte";
  import TopicTimeNewChart from "$lib/ui/time/next-time/TopicTimeNewChart.svelte";
  import LabTimeNewChart from "$lib/ui/time/next-time/LabTimeNewChart.svelte";
  import CalendarTimeNewChart from "$lib/ui/time/next-time/CalendarTimeNewChart.svelte";
  import NewInstructorCalendarTime from "$lib/ui/time/next-time/NewInstructorCalendarTime.svelte";
  import NewInstructorLabTime from "$lib/ui/time/next-time/NewInstructorLabTime.svelte";
  import BoxPlotInstructorChart from "$lib/ui/time/next-time/BoxPlotInstructorChart.svelte";
  import NewLabTime from "$lib/ui/time/next-time/NewLabTime.svelte";
  import NewTopicTime from "$lib/ui/time/next-time/NewTopicTime.svelte";
  import NewInstructorTopicTime from "$lib/ui/time/next-time/NewInstructorTopicTime.svelte";
  import LiveStudentFeed from "$lib/ui/time/next-time/LiveStudentFeed.svelte";

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
      tabSet = 5;
      if (!data.course?.hasCalendar) {
        tabSet = 6;
      }
    }
  }
</script>

<div in:fade={{ duration: 500 }} class="bg-base-200 mt-3">
  <TabGroup selected={storeTab}>
    {#if !instructorMode}
      {#if data.course?.hasCalendar}
        <Tab bind:group={tabSet} name="calendar" value={0}>Calendar</Tab>
      {/if}
      <Tab bind:group={tabSet} name="labs" value={1}>Labs</Tab>
      <Tab bind:group={tabSet} name="labs-chart" value={2}>Labs (new chart)</Tab>
      <Tab bind:group={tabSet} name="topics" value={3}>Topics</Tab>
      <Tab bind:group={tabSet} name="topics-chart" value={4}>Topics (new chart)</Tab>
    {:else}
      {#if data.course?.hasCalendar}
        <Tab bind:group={tabSet} name="calendar-all" value={5}>Calendar (new chart)</Tab>
      {/if}
      {#if data.course?.hasEnrollment}
        <Tab bind:group={tabSet} name="LabsAllStudent" value={6}>Labs(enrolled)</Tab>
        <Tab bind:group={tabSet} name="topicsAllStudent" value={7}>Topics(enrolled)</Tab>
      {/if}
      <Tab bind:group={tabSet} name="allLabsBoxPlot" value={8}>Labs(Box Plot)</Tab>
      <Tab bind:group={tabSet} name="liveStudents" value={9}>Active (now)</Tab>
    {/if}
  </TabGroup>
  {#if tabSet === 0}
    {#if data.course?.hasCalendar}
      <CalendarTimeNewChart user={data.user} calendarData={data.calendar} />
    {/if}
  {:else if tabSet === 1}
    <NewLabTime user={data.user} allLabs={data.allLabs} />
  {:else if tabSet === 2}
    <LabTimeNewChart user={data.user} allLabs={data.allLabs} />
  {:else if tabSet === 3}
    <NewTopicTime user={data.user} topics={data.allTopics} />
  {:else if tabSet === 4}
    <TopicTimeNewChart user={data.user} topics={data.allTopics} />
  {:else if tabSet === 5}
    {#if data.course?.hasEnrollment}
      <NewInstructorCalendarTime userMap={data.enrolledUsers} calendarData={data.calendar} />
    {:else}
      <NewInstructorCalendarTime userMap={data.users} calendarData={data.calendar} />
    {/if}
  {:else if tabSet === 6}
    <NewInstructorLabTime userMap={data.users} allLabs={data.allLabs} />
  {:else if tabSet === 7}
    <NewInstructorTopicTime userMap={data.users} topics={data.allTopics} />
  {:else if tabSet === 8}
    <BoxPlotInstructorChart userMap={data.users} allLabs={data.allLabs} />
  {:else if tabSet === 9}
    <LiveStudentFeed userMap={data.users} courseName={data.course.courseId}/>
  {/if}
</div>
