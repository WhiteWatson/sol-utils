import React from "react";
import { Card, Row, Col, Statistic, Select, DatePicker } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import styles from "./index.module.less";

const { RangePicker } = DatePicker;
const { Option } = Select;

const FundFlow: React.FC = () => {
  return (
    <div className={styles.fundFlow}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>资金流向</h1>
          <p>分析钱包资金流向和交易模式</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="总流入"
              value={125000}
              precision={2}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="总流出"
              value={85000}
              precision={2}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="净流入"
              value={40000}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic title="交易次数" value={156} suffix="次" />
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card className={styles.filterCard}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <RangePicker
              placeholder={["开始时间", "结束时间"]}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select placeholder="选择钱包" style={{ width: "100%" }} allowClear>
              <Option value="wallet1">钱包 1</Option>
              <Option value="wallet2">钱包 2</Option>
              <Option value="wallet3">钱包 3</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select placeholder="代币类型" style={{ width: "100%" }} allowClear>
              <Option value="all">全部</Option>
              <Option value="sol">SOL</Option>
              <Option value="usdc">USDC</Option>
              <Option value="usdt">USDT</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className={styles.chartsRow}>
        <Col xs={24} lg={12}>
          <Card title="资金流向图" className={styles.chartCard}>
            <div className={styles.placeholder}>资金流向桑基图将在这里显示</div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="交易时间分布" className={styles.chartCard}>
            <div className={styles.placeholder}>交易时间热力图将在这里显示</div>
          </Card>
        </Col>
      </Row>

      {/* 详细数据 */}
      <Card title="交易对手方分析" className={styles.tableCard}>
        <div className={styles.placeholder}>
          交易对手方详细数据表格将在这里显示
        </div>
      </Card>
    </div>
  );
};

export default FundFlow;
