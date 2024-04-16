import * as echarts from 'echarts/core';
import {
  TitleComponent,
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';
import { HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { UserMetric } from '$lib/services/types/metrics';

echarts.use([
  TitleComponent,
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent,
  HeatmapChart,
  CanvasRenderer
]);

export function calendarMap(user: UserMetric, bgPatternImg: HTMLImageElement, currentRange: string): EChartsOption {
  return {
    title: {
      top: 30,
      left: 'center',
      text: 'GitHub Account for ' + user?.name || user?.nickname ? user?.name || user?.nickname : '',
      link: 'https://www.github.com/' + user?.nickname || '',
      target: 'self'
    },
    backgroundColor: {
      image: bgPatternImg,
      repeat: 'repeat'
    },
    graphic: [
      {
        type: 'image',
        id: 'user-image',
        left: '5%',  // You might need to adjust this
        top: '2%',
        z: 100,
        bounding: 'raw',
        style: {
          image: user?.picture,  // URL to user's profile picture
          width: 50,
          height: 50
        }
      },

    ],
    responsive: true,
    maintainAspectRatio: false,
    tooltip: { position: 'top' },
    visualMap: {
      min: 0,
      max: 300, // total amount of minutes in a day
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 65,
      pieces: [
        { min: 0, max: 25, color: '#EDEDED' },
        { min: 25, max: 50, color: '#D7E5A1' },
        { min: 50, max: 75, color: '#B0D98C' },
        { min: 75, max: 100, color: '#89CC78' },
        { min: 100, max: 125, color: '#63C168' },
        { min: 125, max: 150, color: '#44B95B' },
        { min: 150, max: 175, color: '#2EA94F' },
        { min: 175, max: 200, color: '#1D9543' },
        { min: 200, max: 225, color: '#0F7C38' },
        { min: 225, max: 250, color: '#006E31' },
        { min: 250, max: 275, color: '#005E2C' },
        { min: 275, max: 300, color: '#004F27' }
      ]
    },
    calendar: {
      top: 120,
      left: '5%',
      right: '5%',
      cellSize: ['auto', 50],
      range: currentRange,
      itemStyle: {
        borderWidth: 0.5
      },
      yearLabel: { show: true }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: user?.calendarActivity?.map((calendar) => ([
        echarts.time.format(calendar.date, '{yyyy}-{MM}-{dd}', false),
        Math.round(calendar.metric / 2) || 0
      ])) || [],
    },
    label: {
      show: true,
      formatter: function (params) {
        return params.value[1]; // Display the value of the heatmap data
      }
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }

};
