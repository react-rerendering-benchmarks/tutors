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
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    BoxplotChart,
    CanvasRenderer
]);

var option: EChartsOption;

export class LabBoxPlot {
    prepareBoxplotData(userDataMap) {
        const boxplotData = [];
        const userNicknames = [];

        userDataMap.forEach((userData, nickname) => {
            userNicknames.push(nickname); // Collect nicknames for the y-axis

            const counts = userData.labActivity.map(activity => activity.count);
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
        const labActivities = new Map();
    
        // Aggregate counts for each lab
        data.forEach(user => {
            user.labActivity.forEach(lab => {
                if (!labActivities.has(lab.title)) {
                    labActivities.set(lab.title, []);
                }
                labActivities.get(lab.title).push(lab.count);
            });
        });
    
        // Calculate boxplot statistics for each lab
        const boxplotData = Array.from(labActivities).map(([title, counts]) => {
            counts.sort((a, b) => a - b);
            const low = counts[0];
            const q1 = d3.quantileSorted(counts, 0.25);
            const median = d3.quantileSorted(counts, 0.5);
            const q3 = d3.quantileSorted(counts, 0.75);
            const high = counts[counts.length - 1];
            return [title, low, q1, median, q3, high];
        });
    
        // Sort by median
        boxplotData.sort((a, b) => a[3] - b[3]);
    
        return boxplotData;
    }

 renderBoxPlot(container, boxplotData, userNicknames) {
        const chart = echarts.init(container);
    
        const option = {
            title: {
                text: 'User Lab Activity Box Plot'
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
                    name: 'Lab Activity',
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
                text: 'Lab Activity Boxplot'
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                data: boxplotData.map(item => item[0]), // Lab titles
                boundaryGap: true,
                nameGap: 30,
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
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
                    name: 'Lab Activities',
                    type: 'boxplot',
                    data: boxplotData.map(item => item.slice(1)) // Boxplot data
                }
            ]
        };
    
        chartInstance.setOption(option);
    }
}




