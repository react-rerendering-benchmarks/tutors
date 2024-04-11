import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, GraphicComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { studentInteractionsUpdates } from '$lib/services/utils/supabase';
import { textureBackground, backgroundPattern } from '../next-charts/next-charts-background-url';

echarts.use([
    BarChart,
    TooltipComponent,
    GridComponent,
    GraphicComponent,
    CanvasRenderer
]);


echarts.use([GraphicComponent, CanvasRenderer]);


const bgTextureImg = textureBackground;
const bgPatternSrc = backgroundPattern;

const piePatternImg = new Image();
piePatternImg.src = bgTextureImg;
const bgPatternImg = new Image();
bgPatternImg.src = bgPatternSrc;

export class LiveStudentFeedSheet {
    constructor(users, courseName) {
        // If users is already a Map, use it directly; otherwise, convert it to a Map
        this.users = users instanceof Map ? users : new Map(Object.entries(users));
        this.chart = null;
        this.courseId = courseName;
        this.loadingIndicator = document.getElementById('loadingIndicator');
       // this.initChart();
    }

    showLoading() {
        this.loadingIndicator.style.display = 'block';
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    // initChart() {
    //     const container = this.getChartContainer();
    //     if (!container) return;
    //     this.chart = echarts.init(container);
    // }

    renderCharts() {
        this.showLoading();

        const container = this.getChartContainer();
        if (!container) return;

        this.chart = echarts.init(container);

        this.updateChartData(Array.from(this.users.values()));
       // this.showLoadingGraphic(); 

        this.chart.showLoading();

        this.subscribeToDataUpdates();
    }

    getChartContainer() {
        const container = document.getElementById('heatmap-container');
        if (container) {
            container.style.width = '100%';
            container.style.height = '100%';
        }
        return container;
    }

    updateChartData(usersData) {
        const chartData = usersData.map(user => user[1] || user);

        const option = {
            backgroundColor: {
                image: bgPatternImg,
                repeat: 'repeat'
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01]
            },
            yAxis: {
                type: 'category',
                data: chartData.map(user => user.nickname)
            },
            series: [{
                type: 'bar',
                data: chartData.map(user => Math.round(user.duration / 2) || 0),
                itemStyle: {
                    color: {
                        image: piePatternImg,
                        repeat: 'repeat'
                    },
                    borderWidth: 3,
                    borderColor: '#235894'
                }
            }],
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} mins'
            }
        };

        this.chart.setOption(option, true);
    }

    subscribeToDataUpdates() {
        studentInteractionsUpdates((updatedUser) => {
            const userKey = updatedUser.student_id;
            if (updatedUser.course_id === this.courseId) {
                this.users.forEach((user, key) => {
                    if (user.nickname === userKey) {
                        this.users.set(key, { ...user, ...updatedUser });
                    } else {
                        this.users.set(key, user);

                        this.updateChartData(Array.from(this.users));
                    }
                });
            }
            // this.hideLoadingGraphic(); 

            this.chart.hideLoading();
            this.hideLoading();

        });
    }
}


