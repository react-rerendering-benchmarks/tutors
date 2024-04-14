import * as echarts from 'echarts/core';
import * as d3 from 'd3';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import type { EChartsOption } from 'echarts';
import { BoxplotChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { backgroundPattern } from '../next-charts/next-charts-background-url';
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BoxplotChart,
  CanvasRenderer
]);

const bgPatternImg = new Image();
bgPatternImg.src = backgroundPattern;

export class TopicBoxPlot {
  prepareBoxplotData(userDataMap) {
    const boxplotData = [];
    const userNicknames = [];

    userDataMap.forEach((userData, nickname) => {
      userNicknames.push(nickname); // Collect nicknames for the y-axis

      const counts = userData?.topicActivity.map(activity => activity.count);
      counts.sort((a, b) => a - b);

      const min = d3.min(counts);
      const q1 = d3.quantileSorted(counts, 0.25);
      const median = d3.median(counts);
      const q3 = d3.quantileSorted(counts, 0.75);
      const max = d3.max(counts);

      boxplotData.push([min, q1, median, q3, max]);
    });

    return { boxplotData, userNicknames };
  }

  //combined boxplot
  prepareCombinedBoxplotData(data) {
    const topicActivities = new Map();

    // Aggregate counts and nicknames for each lab
    data.forEach(user => {
      user?.topicActivity.forEach(topic => {
        if (!topicActivities.has(topic.title)) {
          topicActivities.set(topic.title, []);
        }
        // Push an object containing count and nickname
        topicActivities.get(topic.title).push({ count: topic.count, nickname: user.nickname });
      });
    });

    const boxplotData = Array.from(topicActivities).map(([title, activities]) => {
      activities.sort((a, b) => a.count - b.count);
      const lowData = activities[0];
      const q1 = d3.quantileSorted(activities.map(a => a.count), 0.25);
      const median = d3.quantileSorted(activities.map(a => a.count), 0.5);
      const q3 = d3.quantileSorted(activities.map(a => a.count), 0.75);
      const highData = activities[activities.length - 1];
      // Convert the data into the format expected by ECharts
      return {
        value: [lowData.count, q1, median, q3, highData.count],
        title: title, // Keep the title for xAxis labels
        lowNickname: lowData.nickname,
        highNickname: highData.nickname
      };
    });

    // Sort by median
    boxplotData.sort((a, b) => a.median - b.median);

    return boxplotData;
  }


  renderBoxPlot(container, boxplotData, userNicknames) {
    const chart = echarts.init(container);

    const option = {
      title: {
        text: 'User Topic Activity Box Plot'
      },
      backgroundColor: {
        image: bgPatternImg,
        repeat: 'repeat'
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      yAxis: {
        type: 'category',
        data: userNicknames
      },
      xAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Topic Activity',
          type: 'boxplot',
          data: boxplotData
        }
      ]
    };

    chart.setOption(option);
  }

  renderCombinedBoxplotChart(container, boxplotData) {
    const chartInstance = echarts.init(container);

    const option = {
      title: {
        text: 'Topic Activity Boxplot'
      },
      backgroundColor: {
        image: bgPatternImg,
        repeat: 'repeat'
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: boxplotData.map(item => item.title), // topic titles
        boundaryGap: true,
        nameGap: 30,
        splitArea: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          rotate: -40,
          interval: 0,
          textStyle: {
            fontSize: 15
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Count',
        splitArea: {
          show: true
        }
      },
      series: [
        {
          name: 'Topic Activities',
          type: 'boxplot',
          data: boxplotData.map(item => item.value), // Use the numerical data
          // Add an extra dataset for tooltip info
          dataset: {
            dimensions: ['min', 'Q1', 'median', 'Q3', 'max', 'lowNickname', 'highNickname', 'title'],
            source: boxplotData
          },
          tooltip: {
            // Now the formatter should refer to the series data indices
            formatter: function (params) {
              const dataIndex = params.dataIndex;
              const dataItem = boxplotData[dataIndex];
              let tipHtml = dataItem.title + '<br />';
              tipHtml += 'Min: ' + dataItem.value[0] + ' (' + dataItem.lowNickname + ')<br />';
              tipHtml += 'Q1: ' + dataItem.value[1] + '<br />';
              tipHtml += 'Median: ' + dataItem.value[2] + '<br />';
              tipHtml += 'Q3: ' + dataItem.value[3] + '<br />';
              tipHtml += 'Max: ' + dataItem.value[4] + ' (' + dataItem.highNickname + ')';
              return tipHtml;
            }
          }
        }
      ]
    };

    chartInstance.setOption(option);
  }
}




