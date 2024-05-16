"use client"
import React, { useEffect, useRef } from 'react';
import HighchartsReact from "highcharts-react-official"
import * as Highcharts from "highcharts";
interface DataItem {
  name: string;
  y: number;
  drilldown?: string;
}

interface EscalationMatrixProps {
    title?: string;
    seriesData: Array<{ name: string; data: Array<DataItem> }>;
    type: string;
    seriestype?: any;
  }
  

const EscalationMatrixDashboard: React.FC<EscalationMatrixProps> = ({ title, seriesData, type, }) => {
  const chartRef = useRef<any>(null);
  useEffect(() => {
    require("highcharts/modules/accessibility")(Highcharts);
    if (chartRef.current && seriesData) {
      updateChart();
    }
  }, [chartRef, seriesData, Highcharts])

  const updateChart = () => {
    const chart = chartRef.current.chart;
    

    if (type === 'column') {
      chart.update({
        tooltip: {
          formatter: function () {
            const point = (this as any).point;
            return `<b>${point.name}</b>: ${point.y}`;
          }
        },
        plotOptions: {
          column: {
            allowPointSelect: true,
            showInLegend: false,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '{point.y} '
            },
          }
        }
      })
    }
  }

  const options = {
    chart: {
      type: type,
    },
    title: {
      align: 'center',
      text: title,
    },
    subtitle: {
      align: 'left',
    },
    accessibility: {
      announceNewData: {
        enabled: true,
      },
    },
    xAxis: {
      type: 'category',
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}%',
        },
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    },
    series: seriesData, 
    drilldown: {
      breadcrumbs: {
        position: {
          align: 'right',
        },
      },
      series: [
        {
          name: 'Chrome',
          id: 'Chrome',
          data: [
            ['v65.0', 0.1],
            ['v64.0', 1.3],
          ],
        },
      ],
    },
  };
  

  return <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />;
};

export default EscalationMatrixDashboard;
