import React from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  DatePicker,
  Select,
  Input,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./index.module.less";

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionHistory: React.FC = () => {
  // 模拟交易数据
  const mockTransactions = [
    {
      id: "1",
      timestamp: "2024-01-10 14:30:25",
      type: "transfer",
      token: "SOL",
      amount: 10.5,
      from: "ABC123...XYZ789",
      to: "DEF456...UVW012",
      status: "confirmed",
      fee: 0.000005,
    },
    {
      id: "2",
      timestamp: "2024-01-10 13:15:10",
      type: "swap",
      token: "USDC",
      amount: 5000,
      from: "ABC123...XYZ789",
      to: "GHI789...RST345",
      status: "confirmed",
      fee: 0.000005,
    },
    {
      id: "3",
      timestamp: "2024-01-10 12:45:30",
      type: "transfer",
      token: "USDT",
      amount: 2000,
      from: "DEF456...UVW012",
      to: "ABC123...XYZ789",
      status: "pending",
      fee: 0.000005,
    },
  ];

  const columns = [
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      sorter: true,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "transfer" ? "blue" : "green"}>
          {type === "transfer" ? "转账" : "兑换"}
        </Tag>
      ),
    },
    {
      title: "代币",
      dataIndex: "token",
      key: "token",
      width: 80,
      render: (token: string) => (
        <Tag
          color={
            token === "SOL"
              ? "#9945FF"
              : token === "USDC"
              ? "#2775CA"
              : "#26A17B"
          }
        >
          {token}
        </Tag>
      ),
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number, record: any) => (
        <span>
          {amount.toLocaleString()} {record.token}
        </span>
      ),
    },
    {
      title: "发送方",
      dataIndex: "from",
      key: "from",
      width: 150,
      ellipsis: true,
    },
    {
      title: "接收方",
      dataIndex: "to",
      key: "to",
      width: 150,
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "confirmed" ? "green" : "orange"}>
          {status === "confirmed" ? "已确认" : "待确认"}
        </Tag>
      ),
    },
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
      width: 100,
      render: (fee: number) => <span>{fee} SOL</span>,
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

  return (
    <div className={styles.transactionHistory}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>交易历史</h1>
          <p>查看钱包的所有交易记录</p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => console.log("刷新交易数据")}
        >
          刷新
        </Button>
      </div>

      {/* 筛选器 */}
      <Card className={styles.filterCard}>
        <Space wrap>
          <RangePicker placeholder={["开始时间", "结束时间"]} showTime />
          <Select placeholder="交易类型" style={{ width: 120 }} allowClear>
            <Option value="transfer">转账</Option>
            <Option value="swap">兑换</Option>
          </Select>
          <Select placeholder="代币类型" style={{ width: 120 }} allowClear>
            <Option value="SOL">SOL</Option>
            <Option value="USDC">USDC</Option>
            <Option value="USDT">USDT</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 100 }} allowClear>
            <Option value="confirmed">已确认</Option>
            <Option value="pending">待确认</Option>
          </Select>
          <Input
            placeholder="搜索地址"
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary">搜索</Button>
          <Button>重置</Button>
        </Space>
      </Card>

      {/* 交易表格 */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={mockTransactions}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default TransactionHistory;
