import React from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Switch,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useWallet } from "@/contexts/WalletContext";
import styles from "./index.module.less";

const { Option } = Select;

const AlertSettings: React.FC = () => {
  const { state, addAlert, updateAlert, removeAlert, toggleAlert } =
    useWallet();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingAlert, setEditingAlert] = React.useState<any>(null);

  const columns = [
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "balance" ? "blue" : "green"}>
          {type === "balance" ? "余额告警" : "价格告警"}
        </Tag>
      ),
    },
    {
      title: "代币",
      dataIndex: "token",
      key: "token",
      render: (token: string) => (
        <Tag
          color={
            token === "sol"
              ? "#9945FF"
              : token === "usdc"
              ? "#2775CA"
              : "#26A17B"
          }
        >
          {token.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "条件",
      dataIndex: "condition",
      key: "condition",
      render: (condition: string, record: any) => (
        <span>
          {condition === "above" ? "高于" : "低于"} {record.value}
          {record.token === "sol" ? " SOL" : " $"}
        </span>
      ),
    },
    {
      title: "通知",
      dataIndex: "notification",
      key: "notification",
      render: (notification: boolean) => (
        <Tag color={notification ? "green" : "default"}>
          {notification ? "开启" : "关闭"}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      render: (enabled: boolean, record: any) => (
        <Switch checked={enabled} onChange={() => toggleAlert(record.id)} />
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingAlert(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (alert: any) => {
    setEditingAlert(alert);
    form.setFieldsValue(alert);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个告警设置吗？",
      onOk: () => removeAlert(id),
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingAlert) {
        updateAlert({ ...editingAlert, ...values });
      } else {
        addAlert(values);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div className={styles.alertSettings}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>告警设置</h1>
          <p>配置钱包余额和价格告警</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加告警
        </Button>
      </div>

      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={state.alerts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingAlert ? "编辑告警" : "添加告警"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical" className={styles.form}>
          <Form.Item
            name="type"
            label="告警类型"
            rules={[{ required: true, message: "请选择告警类型" }]}
          >
            <Select placeholder="选择告警类型">
              <Option value="balance">余额告警</Option>
              <Option value="price">价格告警</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="token"
            label="代币"
            rules={[{ required: true, message: "请选择代币" }]}
          >
            <Select placeholder="选择代币">
              <Option value="sol">SOL</Option>
              <Option value="usdc">USDC</Option>
              <Option value="usdt">USDT</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="condition"
            label="条件"
            rules={[{ required: true, message: "请选择条件" }]}
          >
            <Select placeholder="选择条件">
              <Option value="above">高于</Option>
              <Option value="below">低于</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="阈值"
            rules={[{ required: true, message: "请输入阈值" }]}
          >
            <InputNumber
              placeholder="输入阈值"
              style={{ width: "100%" }}
              min={0}
              precision={2}
            />
          </Form.Item>

          <Form.Item name="notification" label="通知" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="email" label="邮件通知" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertSettings;
