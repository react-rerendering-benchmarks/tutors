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
let listOfLabs: any[] = [];
let user: UserMetric;

export class TopicCountSheet {
    chartRendered: boolean = false;

    constructor() {
        this.myChart = null; 

    }

    populateCols(los: Lo[]) {
        los.forEach((lab) => {
            listOfLabs.push(lab.title);
        });
    }

    populateUserData(userData: UserMetric) {
        user = userData;
    }

    renderChart() {
        if (this.myChart === null) {
            // If chart instance doesn't exist, create a new one
            this.myChart = echarts.init(document.getElementById('chart'));
        }

        option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                data: [
                    user.topicActivity.map((topic) => topic.title)
                ]
            },
            series: [
                {
                    name: 'Inner Pie',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],
                    label: {
                        position: 'inner',
                        fontSize: 14
                    },
                    labelLine: {
                        show: false
                    },
                    data: user.topicActivity.map((topic) => ({
                        value: topic.count,
                        name: topic.title
                    }))
                },
                {
                    name: 'Outer Pie',
                    type: 'pie',
                    radius: ['45%', '60%'],
                    labelLine: {
                        length: 30
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
                    data: user.topics.map((topic) => ({
                        value: topic.total_duration,
                        name: topic.title
                    }))
                }
            ]
        };
        // Initialize outerPieData as an empty array
        let outerPieData = [];

        // Listen to click event on the inner pie chart
        this.myChart.on('click', (params) => {
            if (params.seriesName === 'Inner Pie') {
                outerPieData = []; // Reset outerPieData array

                // Find the corresponding data for the clicked inner pie slice
                user.topics.forEach((topic) => {
                    if (topic.topic_title === params.name) {
                        outerPieData.push({ value: topic.total_duration, name: topic.title });
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

        option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                data: user.topicActivity.map((topic) => topic.title)
            },
            series: [
                {
                    name: 'Inner Pie',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],
                    label: {
                        position: 'inner',
                        fontSize: 14
                    },
                    labelLine: {
                        show: false
                    },
                    data: user.topicActivity.map((topic) => ({
                        value: topic.count || 0, // Set count to 0 if falsy
                        name: topic.title
                    }))
                },
                {
                    name: 'Outer Pie',
                    type: 'pie',
                    radius: ['45%', '60%'],
                    labelLine: {
                        length: 30
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
                    data: user.topics.map((topic) => ({
                        value: topic.total_duration,
                        name: topic.title
                    }))
                }
            ]
        };
        this.myChart.setOption(option);
    }
}

