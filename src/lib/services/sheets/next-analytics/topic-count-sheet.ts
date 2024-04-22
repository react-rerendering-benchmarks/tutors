import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  type TooltipComponentOption,
  LegendComponent,
  type LegendComponentOption
} from 'echarts/components';
import { PieChart, type PieSeriesOption } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type { UserMetric } from '$lib/services/types/metrics';
import { backgroundPattern } from '../next-charts/next-charts-background-url';
import type { Topic } from '$lib/services/models/lo-types';
import { StudentPieChart } from '../next-charts/pie-chart';

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout
]);

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | LegendComponentOption | PieSeriesOption
>;

let listOfTopics: any[] = [];
let user: UserMetric;

const bgPatternSrc = backgroundPattern;

const bgPatternImg = new Image();
bgPatternImg.src = bgPatternSrc;

export class TopicCountSheet {
  chartRendered: boolean = false;

  constructor() {
    this.myChart = null;
    this.listOfTopics = [];
    this.users = null;
    this.user = null;
  }

  populateCols(topics: Topic[]) {
    topics.forEach((topic) => {
      this.listOfTopics.push(topic.title);
    });
  }

  populateUserData(userData: UserMetric) {
    this.user = userData;
  };

  // ** START Populate the data for all users

  populateUsersData(usersData) {
    this.users = usersData || [];
  };

  renderChart() {
    if (this.myChart === null) {
      // If chart instance doesn't exist, create a new one
      this.myChart = echarts.init(document.getElementById('chart'));
    }
    if (this.users === null) {
      const singleUserInnerData = this.user?.topicActivity.map((topic) => ({
        value: topic.count,
        name: topic.title
      }))

      const singleUserOuterData = this.user?.topics.map((topic) => ({
        value: topic.total_duration,
        name: topic.title
      }))

      const option = StudentPieChart(bgPatternImg, this.user, [],  singleUserInnerData, singleUserOuterData);

      this.myChart.setOption(option);

      let outerPieData = [];

      // Listen to click event on the inner pie chart
      this.myChart.on('click', (params) => {
        if (params.seriesName === 'Inner Pie') {
          outerPieData = []; // Reset outerPieData array

          // Find the corresponding data for the clicked inner pie slice
          this.user.topics.forEach((topic) => {
            if (topic.topic_title === params.name) {
              outerPieData.push({ value: topic.total_duration, name: topic.lo_title });
            }
          });

          // Update the data for the outer pie chart
          const chartInstance = echarts.getInstanceByDom(document.getElementById('chart'));
          if (chartInstance) {
            chartInstance.setOption({
              series: [{
                name: 'Outer Pie',
                data: outerPieData
              }]
            });
          }
        }
      });
    } else {

      this.myChart.on('click', (params) => {
        if (params.seriesName === 'Inner Pie') {
          // Aggregate total_duration for the clicked topic for all users
          const usersArray = Array.from(this.users.values());
          const outerPieData = usersArray.reduce((acc, user) => {
            user.topics.forEach(topic => {
              if (topic.topic_title === params.name) {

                const existing = acc.find(a => a.name === topic.lo_title);
                if (existing) {
                  existing.value += topic.total_duration;
                } else {
                  acc.push({ value: topic.total_duration, name: topic.lo_title });
                }
              }

            });

            return acc;
          }, []);

          // Update the data for the outer pie chart
          const chartInstance = echarts.getInstanceByDom(document.getElementById('chart'));
          if (chartInstance) {
            chartInstance.setOption({
              series: [{
                name: 'Outer Pie',
                data: outerPieData
              }]
            });
          }
        }
      });

      let allUsersTopicActivity = [];
      const usersArray = Array.from(this.users.values());
      allUsersTopicActivity = usersArray.reduce((acc, user) => {
        user.topicActivity.forEach(activity => {
          let existing = acc.find(item => item.name === activity.title);
          if (existing) {
            existing.value += activity.count;
          } else {
            acc.push({ value: activity.count, name: activity.title });
          }
        });
        return acc;
      }, []);

      const option = StudentPieChart(bgPatternImg, user, allUsersTopicActivity, [], []);

      this.myChart.setOption(option);
    }

  }
}

