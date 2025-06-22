import React from "react";
import { Card, Select } from "antd";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoryData {
  timestamp: string;
  sol: number;
  usdc: number;
  usdt: number;
}

interface BalanceChartProps {
  data: HistoryData[];
  loading?: boolean;
}

const BalanceChart: React.FC<BalanceChartProps> = ({
  data,
  loading = false,
}) => {
  const chartData = {
    labels: data.map((item) => new Date(item.timestamp).toLocaleString()),
    datasets: [
      {
        label: "SOL",
        data: data.map((item) => item.sol),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "USDC",
        data: data.map((item) => item.usdc),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "USDT",
        data: data.map((item) => item.usdt),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "余额变化趋势",
      },
    },
  };

  return (
    <Card title="余额历史" loading={loading}>
      {data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>暂无数据</div>
      )}
    </Card>
  );
};

export default BalanceChart;
