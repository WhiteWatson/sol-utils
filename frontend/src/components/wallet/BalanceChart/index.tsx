import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { HistoryData } from "../../../services/api";

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
]);

interface BalanceChartProps {
  historyData: HistoryData[] | null;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ historyData }) => {
  if (!historyData) {
    return <div>Loading...</div>;
  }

  const dates = historyData.map((item) => item.timestamp.slice(5, 10));
  const solData = historyData.map((item) => item.sol);
  const usdcData = historyData.map((item) => item.usdc);
  const usdtData = historyData.map((item) => item.usdt);

  const option = {
    title: {
      text: "余额变化趋势",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
      formatter: function (params: any) {
        let result = params[0].axisValue + "<br/>";
        params.forEach((param: any) => {
          result += param.marker + param.seriesName + ": " + param.value;
          if (param.seriesName === "SOL") {
            result += " SOL";
          } else {
            result += " $";
          }
          result += "<br/>";
        });
        return result;
      },
    },
    legend: {
      data: ["SOL", "USDC", "USDT"],
      top: 30,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLabel: {
        formatter: function (value: string) {
          return value.slice(5); // 只显示月-日
        },
      },
    },
    yAxis: [
      {
        type: "value",
        name: "SOL",
        position: "left",
        axisLabel: {
          formatter: "{value} SOL",
        },
      },
      {
        type: "value",
        name: "USD",
        position: "right",
        axisLabel: {
          formatter: "${value}",
        },
      },
    ],
    series: [
      {
        name: "SOL",
        type: "line",
        yAxisIndex: 0,
        data: solData,
        smooth: true,
        lineStyle: {
          color: "#9945FF",
          width: 3,
        },
        itemStyle: {
          color: "#9945FF",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(153, 69, 255, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(153, 69, 255, 0.1)",
              },
            ],
          },
        },
      },
      {
        name: "USDC",
        type: "line",
        yAxisIndex: 1,
        data: usdcData,
        smooth: true,
        lineStyle: {
          color: "#2775CA",
          width: 3,
        },
        itemStyle: {
          color: "#2775CA",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(39, 117, 202, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(39, 117, 202, 0.1)",
              },
            ],
          },
        },
      },
      {
        name: "USDT",
        type: "line",
        yAxisIndex: 1,
        data: usdtData,
        smooth: true,
        lineStyle: {
          color: "#26A17B",
          width: 3,
        },
        itemStyle: {
          color: "#26A17B",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(38, 161, 123, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(38, 161, 123, 0.1)",
              },
            ],
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default BalanceChart;
