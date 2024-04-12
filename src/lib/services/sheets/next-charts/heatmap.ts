import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  GridComponent,
  VisualMapComponent
} from 'echarts/components';
import { HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  HeatmapChart,
  CanvasRenderer
]);

export function heatmap(categories: any, yAxisData: any, series: any, bgPatternImg: HTMLImageElement, chartTitleString: string) {
  return {
    title: {
      top: 30,
      left: 'center',
      text: chartTitleString,
    },
    tooltip: {
      position: 'top'
    },
    backgroundColor: {
      image: bgPatternImg,
      repeat: 'repeat'
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '30%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from(categories),
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: -40,
        interval: 0,
        textStyle: {
          fontSize: 15
        }
      },
      position: 'bottom'
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        textStyle: {
          fontSize: 15
        }
      },
    },
    visualMap: {
      min: 0,
      max: series[0].data ? Math.max(...series[0].data.map(item => item[2])) : 0,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: '5%'
    },
    series: series
  }
}