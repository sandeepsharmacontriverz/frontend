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
  data: any;
  seriestype?: any;
  type: string;
  seriesname?: any
}

const EscalationMatrixDashboard: React.FC<EscalationMatrixProps> = ({ title, data, type, seriestype, seriesname }) => {
  const chartRef = useRef<any>(null);
  useEffect(() => {
    require("highcharts/modules/accessibility")(Highcharts);
    if (chartRef.current && data) {
      updateChart();
    }
  }, [chartRef, data, Highcharts])

  const updateChart = () => {
    const chart = chartRef.current.chart;
    if (type === 'pie') {
      chart.update({
        tooltip: {
          formatter: function () {
            const point = (this as any).point;
            return `<b>${point.name}</b>: ${point.y}`;
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            showInLegend: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %'
            },
          }
        }
      })
    }

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
        enabled: true
      }
    },
    xAxis: {
      type: 'category'
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}%'
        }
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    },
    series: [
      {
        type: seriestype,
        name: seriesname,
        data: data,
      }
    ],
    drilldown: {
      breadcrumbs: {
        position: {
          align: 'right'
        }
      },
      series: [
        {
          name: 'Chrome',
          id: 'Chrome',
          data: [
            ['v65.0', 0.1],
            ['v64.0', 1.3],

          ]
        },
      ]
    }
  };

  return <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />;
};

export default EscalationMatrixDashboard;
