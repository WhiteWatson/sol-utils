import React from "react";
import { Card, Space } from "antd";
import { Line } from "react-chartjs-2";
import TimeRangeSelector, { TimeRange } from "./TimeRangeSelector";
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
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

const BalanceChart: React.FC<BalanceChartProps> = ({
  data,
  loading = false,
  timeRange,
  onTimeRangeChange,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === "1d" || timeRange === "12h" || timeRange === "6h") {
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
  };

  const chartData = {
    labels: data.map((item) => formatTimestamp(item.timestamp)),
    datasets: [
      {
        label: "SOL",
        data: data.map((item) => item.sol),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.1,
        pointRadius: 3,
      },
      {
        label: "USDC",
        data: data.map((item) => item.usdc),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        tension: 0.1,
        pointRadius: 3,
      },
      {
        label: "USDT",
        data: data.map((item) => item.usdt),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        tension: 0.1,
        pointRadius: 3,
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
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "时间",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "余额",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <Card
      title="余额历史"
      loading={loading}
      extra={
        <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
      }
    >
      {data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>暂无数据</div>
      )}
    </Card>
  );
};

export default BalanceChart;
