import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { BalanceData } from "../../../services/api";

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
]);

interface AssetPieChartProps {
  balanceData: BalanceData | null;
}

const AssetPieChart: React.FC<AssetPieChartProps> = ({ balanceData }) => {
  if (!balanceData) {
    return <div>Loading...</div>;
  }

  const data = [
    { value: balanceData.sol, name: "SOL", price: balanceData.prices.sol },
    { value: balanceData.usdc, name: "USDC", price: balanceData.prices.usdc },
    { value: balanceData.usdt, name: "USDT", price: balanceData.prices.usdt },
  ];

  const option = {
    title: {
      text: "资产分布",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        const total = data.reduce(
          (sum, item) => sum + item.value * item.price,
          0
        );
        const percentage = (
          ((params.value * params.data.price) / total) *
          100
        ).toFixed(1);
        return `${params.name}<br/>数量: ${params.value}<br/>价值: $${(
          params.value * params.data.price
        ).toLocaleString()}<br/>占比: ${percentage}%`;
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
    },
    series: [
      {
        name: "资产分布",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "18",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({
          ...item,
          itemStyle: {
            color:
              item.name === "SOL"
                ? "#9945FF"
                : item.name === "USDC"
                ? "#2775CA"
                : "#26A17B",
          },
        })),
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

export default AssetPieChart;
