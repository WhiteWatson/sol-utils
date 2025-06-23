import React from "react";
import { Radio, Space } from "antd";

export type TimeRange =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "6h"
  | "12h"
  | "1d";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const timeRangeOptions = [
    { label: "1分钟", value: "1m" },
    { label: "5分钟", value: "5m" },
    { label: "15分钟", value: "15m" },
    { label: "30分钟", value: "30m" },
    { label: "1小时", value: "1h" },
    { label: "6小时", value: "6h" },
    { label: "12小时", value: "12h" },
    { label: "1天", value: "1d" },
  ];

  return (
    <Radio.Group value={value} onChange={(e) => onChange(e.target.value)}>
      <Space>
        {timeRangeOptions.map((option) => (
          <Radio.Button key={option.value} value={option.value}>
            {option.label}
          </Radio.Button>
        ))}
      </Space>
    </Radio.Group>
  );
};

export default TimeRangeSelector;
