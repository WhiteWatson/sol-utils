import React from "react";
import { Card, Row, Col, Statistic, Tag } from "antd";
import { DollarOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";

interface BalanceData {
  sol: number;
  usdc: number;
  usdt: number;
  prices: {
    sol: number;
    usdc: number;
    usdt: number;
  };
}

interface BalanceCardProps {
  data: BalanceData;
  loading?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ data, loading = false }) => {
  const solValue = data.sol * data.prices.sol;
  const usdcValue = data.usdc * data.prices.usdc;
  const usdtValue = data.usdt * data.prices.usdt;
  const totalValue = solValue + usdcValue + usdtValue;

  return (
    <Card title="当前余额" loading={loading} style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="SOL"
            value={data.sol}
            precision={4}
            suffix={
              <span>
                <br />
                <small>≈ ${solValue.toFixed(2)}</small>
              </span>
            }
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="USDC"
            value={data.usdc}
            precision={2}
            suffix={
              <span>
                <br />
                <small>≈ ${usdcValue.toFixed(2)}</small>
              </span>
            }
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="USDT"
            value={data.usdt}
            precision={2}
            suffix={
              <span>
                <br />
                <small>≈ ${usdtValue.toFixed(2)}</small>
              </span>
            }
          />
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Statistic
            title="总价值 (USD)"
            value={totalValue}
            precision={2}
            prefix={<DollarOutlined />}
            valueStyle={{ color: "#3f8600" }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default BalanceCard;
