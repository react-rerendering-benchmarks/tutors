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
import type { Lo } from '$lib/services/models/lo-types';

//barchart
import {
  GridComponent,
} from 'echarts/components';
import { BarChart, type BarSeriesOption } from 'echarts/charts';
import { backgroundPattern, textureBackground } from '../next-charts/next-charts-background-url';

echarts.use([GridComponent, LegendComponent, BarChart, CanvasRenderer]);

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

var option: EChartsOption;

const bgTexture = textureBackground;
const bgPatternSrc = backgroundPattern;

const piePatternImg = new Image();
piePatternImg.src = bgTexture;
const bgPatternImg = new Image();
bgPatternImg.src = bgPatternSrc;
let user: UserMetric;

export class LabCountSheet {
  constructor() {
    this.myChart = null;
    this.listOfLabs = [];
    //this.user = null;
  }

  populateCols(los: Lo[]) {
    los.forEach((lab) => {
      this.listOfLabs.push(lab.title);
    });
  }

  populateUserData(userData: UserMetric) {
    // this.user = userData;
    user = userData;
  }

  createChartContainer(containerId: string) {
    const container = document.createElement('div');
    container.id = `${containerId}`;
    document.body.appendChild(container);  // Append the container to the body or a specific parent element
    return container;
  }

  renderChart() {
    const chartId = user ? `chart-${user?.nickname}` : 'chart';
    let chartContainer = document.getElementById(chartId);

    // Create chart container dynamically if it doesn't exist
    if (!chartContainer) {
      chartContainer = this.createChartContainer(chartId)
    }

    // Initialise chart in the specific container
    this.myChart = echarts.init(chartContainer);

    const grid = {
      top: 50,
      width: '40%',
      bottom: '30%',
      left: 34,
      containLabel: true
    };

    const series: (PieSeriesOption | BarSeriesOption)[] = [];

    // Inner Pie Series Configuration
    series.push({
      name: 'Inner Pie',
      type: 'pie',
      selectedMode: 'single',
      center: ['70%', '70%'],
      bottom: '45%',
      radius: [0, '40%'],
      color: [
        '#4d4dff', // Dark blue
        '#6699ff', // Light blue
        '#99ccff', // Sky blue
        '#b3d9ff', // Pale blue
        '#ccffff', // Very light blue
        '#ccffcc', // Pale green
        '#99ff99', // Light green
        '#66cc66', // Green
        '#339933', // Dark green
        '#006600'  // Deep green
      ],
      label: {
        position: 'inner',
        fontSize: 14
      },
      labelLine: {
        show: false
      },
      data: user?.labActivity.map((lab) => ({
        value: Math.round(lab.count / 2) || 0, // Set count to 0 if falsy
        name: lab.title
      })) || []
    });

    // Outer Pie Series Configuration
    series.push({
      name: 'Outer Pie',
      type: 'pie',
      center: ['70%', '70%'],
      bottom: '45%',
      radius: ['90%', '80%'],
      labelLine: {
        length: 3
      },
      label: {
        formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}:}{c}  {per|{d}%}  ',
        backgroundColor: '#F6F8FC',
        borderColor: '#8C8D8E',
        borderWidth: 1,
        borderRadius: 4,
        rich: {
          a: {
            color: '#6E7079',
            lineHeight: 22,
            align: 'center'
          },
          hr: {
            borderColor: '#8C8D8E',
            width: '100%',
            borderWidth: 1,
            height: 0
          },
          b: {
            color: '#4C5058',
            fontSize: 14,
            fontWeight: 'bold',
            lineHeight: 33
          },
          per: {
            color: '#fff',
            backgroundColor: '#4C5058',
            padding: [3, 4],
            borderRadius: 4
          }
        }
      },
      data: []
    });

    // Bar Chart Series Configuration
    series.push({
      name: 'Bar Chart',
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
      label: {
        show: false,
        formatter: (params: any) => `{a|${params.name}}\n{hr|}\n  {b|${Math.round(params.value) / 2}} mins  `,
        backgroundColor: '#F6F8FC',
        borderColor: '#8C8D8E',
        borderWidth: 1,
        borderRadius: 4,
        rich: {
          a: {
            color: '#6E7079',
            lineHeight: 22,
            align: 'center'
          },
          hr: {
            borderColor: '#8C8D8E',
            width: '100%',
            borderWidth: 1,
            height: 0
          },
          b: {
            color: '#4C5058',
            fontSize: 14,
            fontWeight: 'bold',
            lineHeight: 33
          },
          per: {
            color: '#fff',
            backgroundColor: '#4C5058',
            padding: [3, 4],
            borderRadius: 4
          }
        }
      },
      itemStyle: {
        opacity: 0.7,
        color: {
          image: piePatternImg,
          repeat: 'repeat'
        },
        borderWidth: 3,
        borderColor: '#235894'
      },
      data: []
    });

    // Option Configuration
    option = {
      backgroundColor: {
        image: bgPatternImg,
        repeat: 'repeat'
      },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category', data: this.listOfLabs.filter(lab => lab)
        , axisLabel: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} mins'
      },
      itemStyle: {
        opacity: 0.7,
        color: {
          image: piePatternImg,
          repeat: 'repeat'
        },
        borderWidth: 3,
        borderColor: '#235894'
      },
      series: series,
      grid: grid,
    };

    let outerPieData = [];
    let axisLabels = [];

    this.myChart.on('click', (params) => {
      if (params.seriesName === 'Inner Pie') {
        outerPieData = []; // Reset outerPieData array
        axisLabels = []; // Reset axisLabels array

        // Find the corresponding data for the clicked inner pie slice
        user?.detailedLabInfo.forEach((lab) => {
          if (lab.lab_title === params.name) {
            outerPieData.push({ value: Math.round(lab.total_duration / 2), name: lab.title });
            axisLabels.push(lab.title); // Push the title directly, not an object
          }
        });

        // Update the data for the outer pie chart
        const chartInstance = echarts.getInstanceByDom(document.getElementById('chart-' + user?.nickname));
        if (chartInstance) {
          chartInstance.setOption({
            series: [{ name: 'Outer Pie', data: outerPieData }]
          });

          // Update options for both the outer pie chart and the bar chart
          chartInstance.setOption({
            series: [
              {
                name: 'Bar Chart',
                data: outerPieData
              }
            ],
            xAxis: { type: 'value' },
            yAxis: { type: 'category', data: axisLabels }, // Update yAxis with axisLabels
            color: [
              '#4d4dff', // Dark blue
              '#6699ff', // Light blue
              '#99ccff', // Sky blue
              '#b3d9ff', // Pale blue
              '#ccffff', // Very light blue
              '#ccffcc', // Pale green
              '#99ff99', // Light green
              '#66cc66', // Green
              '#339933', // Dark green
              '#006600'  // Deep green
            ],
          });
        }
      }
    });

    this.myChart.setOption(option);
  }
}
