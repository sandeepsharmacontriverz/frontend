"use client";

import React, { useEffect, useState, useRef } from "react";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Loader from "@components/core/Loader";
// import Loading from "@/app/loading";

interface ChartProps {
  titleChart: string;
  series?:any
}

const Chart = ({
  titleChart,
  series
}: ChartProps) => {
  const chartRef = useRef<any>(null);

  const [isHighchartsReady, setIsHighchartsReady] = useState(false);

  useEffect(() => {
    require("highcharts/highcharts-3d")(Highcharts);
    require("highcharts/modules/accessibility")(Highcharts);
    setIsHighchartsReady(true);
  }, [Highcharts]);

  const options: Highcharts.Options = {
    chart: {
      type: "column",
      options3d: {
        enabled: true,
        alpha: 10,
        beta: 20,
        depth: 40,
        viewDistance: 55,
        frame: {
          bottom: { size: 1, color: "rgba(0,0,0,0.02)" },
          back: { size: 1, color: "rgba(0,0,0,0.04)" },
        },
      },
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: ["Farmer", "Area(Acres)", "Expected Paddy"],
    },
    yAxis: {
      title: {
        text: "",
      },
    },
    zAxis: {
      title: {
        text: null,
      },
    },
    plotOptions: {
      column: {
        depth: 35,
      },
    },
    accessibility: {
      enabled: false
    },
    credits: {
      enabled: false,
    },
    series
  };

  return (
    <div className="w-full">
      <div className="mt-5">
      <h3 className="font-semibold text-xl">{titleChart}</h3>
      </div>
      <div className="mt-3 mb-5 rounded-md overflow-hidden">
      {isHighchartsReady ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        <Loader />
      )}
      </div>
    </div>
  );
};

export default Chart;
