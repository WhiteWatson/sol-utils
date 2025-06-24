import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Switch,
  Table,
  Tag,
  Space,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";

const { Option } = Select;

const SniperConsole: React.FC = () => {
  const [isRunning, setIsRunning] = React.useState(false);

  const columns = [
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 180,
    },
    {
      title: "代币",
      dataIndex: "token",
      key: "token",
      width: 120,
      render: (token: string) => <Tag color="#9945FF">{token}</Tag>,
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => `$${price.toFixed(6)}`,
    },
    {
      title: "变化",
      dataIndex: "change",
      key: "change",
      width: 100,
      render: (change: number) => (
        <span style={{ color: change >= 0 ? "#3f8600" : "#cf1322" }}>
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag
          color={
            status === "success"
              ? "green"
              : status === "pending"
              ? "orange"
              : "red"
          }
        >
          {status === "success"
            ? "成功"
            : status === "pending"
            ? "进行中"
            : "失败"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="link" size="small">
            详情
          </Button>
          <Button type="link" size="small">
            复制
          </Button>
        </Space>
      ),
    },
  ];

  const mockData = [
    {
      key: "1",
      time: "2024-01-10 14:30:25",
      token: "SOL",
      price: 100.123456,
      change: 5.67,
      status: "success",
    },
    {
      key: "2",
      time: "2024-01-10 14:29:15",
      token: "USDC",
      price: 1.0,
      change: -0.12,
      status: "pending",
    },
  ];

  return (
    <div className={styles.sniperConsole}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>狙击控制台</h1>
          <p>监控和自动交易 Solana 代币</p>
        </div>
        <Space>
          <Button
            type={isRunning ? "default" : "primary"}
            icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? "停止" : "启动"}
          </Button>
          <Button icon={<SettingOutlined />}>设置</Button>
        </Space>
      </div>

      {/* 控制面板 */}
      <Row gutter={[16, 16]} className={styles.controlPanel}>
        <Col xs={24} lg={8}>
          <Card title="监控设置" className={styles.controlCard}>
            <div className={styles.settingItem}>
              <span>监控代币</span>
              <Select
                mode="multiple"
                placeholder="选择要监控的代币"
                style={{ width: "100%" }}
                defaultValue={["SOL", "USDC"]}
              >
                <Option value="SOL">SOL</Option>
                <Option value="USDC">USDC</Option>
                <Option value="USDT">USDT</Option>
              </Select>
            </div>
            <div className={styles.settingItem}>
              <span>价格阈值</span>
              <Input placeholder="输入价格阈值" />
            </div>
            <div className={styles.settingItem}>
              <span>变化率阈值</span>
              <Input placeholder="输入变化率阈值 (%)" />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="交易设置" className={styles.controlCard}>
            <div className={styles.settingItem}>
              <span>自动交易</span>
              <Switch defaultChecked />
            </div>
            <div className={styles.settingItem}>
              <span>交易金额</span>
              <Input placeholder="输入交易金额" />
            </div>
            <div className={styles.settingItem}>
              <span>滑点容忍度</span>
              <Input placeholder="输入滑点容忍度 (%)" />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="系统状态" className={styles.controlCard}>
            <div className={styles.statusItem}>
              <span>运行状态</span>
              <Tag color={isRunning ? "green" : "red"}>
                {isRunning ? "运行中" : "已停止"}
              </Tag>
            </div>
            <div className={styles.statusItem}>
              <span>连接状态</span>
              <Tag color="green">已连接</Tag>
            </div>
            <div className={styles.statusItem}>
              <span>监控代币数</span>
              <span>3 个</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 实时数据 */}
      <Card title="实时监控数据" className={styles.dataCard}>
        <Table
          columns={columns}
          dataSource={mockData}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default SniperConsole;
