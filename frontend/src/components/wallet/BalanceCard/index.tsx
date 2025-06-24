import React from "react";
import { Card, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import styles from "./index.module.less";

interface BalanceCardProps {
  title: string;
  balance: number;
  price: number;
  change: number;
  color: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  balance,
  price,
  change,
  color,
}) => {
  const totalValue = balance * price;
  const isPositive = change >= 0;

  return (
    <Card className={styles.balanceCard}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div
          className={styles.colorIndicator}
          style={{ backgroundColor: color }}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.balance}>
          <span className={styles.amount}>{balance.toLocaleString()}</span>
          <span className={styles.unit}>{title}</span>
        </div>

        <div className={styles.value}>${totalValue.toLocaleString()}</div>

        <div className={styles.change}>
          <span
            className={`${styles.changeValue} ${
              isPositive ? styles.positive : styles.negative
            }`}
          >
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(change)}%
          </span>
          <span className={styles.changeLabel}>24h</span>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;
