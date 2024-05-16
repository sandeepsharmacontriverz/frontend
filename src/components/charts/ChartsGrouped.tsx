'use client'
import React, { useEffect, useState, useRef } from "react";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface ChartProps {
  titleChart?: string;
  title?: string;
  type?: string;
  categoriesList?: any;
  dataChart?: any;
  categoryTitle?: any;
  tooltipShow?: any;
  themeColors?: string[];
}

const ChartsGrouped = ({
  titleChart,
  title,
  type,
  categoriesList,
  dataChart,
  categoryTitle,
  tooltipShow,
  themeColors = [],
}: ChartProps) => {
  const chartRef = useRef<any>(null);
  const [isHighchartsReady, setIsHighchartsReady] = useState(false);

  useEffect(() => {
    require("highcharts/modules/accessibility")(Highcharts);
    setIsHighchartsReady(true);
  }, [Highcharts]);

  const generateNewColor = (index: number) => {
    // Generate new color based on index
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 60%, 60%)`;
  };

  const assignColorsToSeries = () => {
    let seriesData = [];
    if (dataChart && Array.isArray(dataChart)) {
      for (let i = 0; i < dataChart.length; i++) {
        let color = i < themeColors.length ? themeColors[i] : generateNewColor(i);
        seriesData.push({ ...dataChart[i], color });
      }
    }
    return seriesData;
  };

  const options = {
    chart: {
      type: type,
    },
    title: {
      align: "center",
      text: title,
    },
    tooltip: {},
    xAxis: {
      categories: categoriesList,
      labels: {
        enabled: categoriesList?.length > 0 ? true : false,
      },
      title: {
        style: {
          textAlign: "center",
        },
        text: categoryTitle,
      },
    },
    yAxis: {
      title: {
        text: "Value",
      },
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          allowOverlap: false,
          crop: false,
          padding: 4,
          formatter: function (this: any) {
            return this.y;
          },
        },
      },
    },

    credits: {
      enabled: false,
    },
    accessibility: {
      enabled: false,
    },
    series: assignColorsToSeries(),
  } as Highcharts.Options;

  if (tooltipShow) {
    options.tooltip = tooltipShow;
  }

  return (
    <div className="items-center">
      {titleChart && (
        <h1 className="flex justify-center py-4 font-bold">{titleChart}</h1>
      )}
      {isHighchartsReady ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        "loading..."
      )}
    </div>
  );
};

export default ChartsGrouped;
