# Solana 余额监控系统 - 后端

## 功能特性

- ✅ SOL、USDC、USDT 余额查询
- ✅ 实时价格获取 (CoinGecko API)
- ✅ 定时数据采集 (每分钟)
- ✅ 余额历史查询
- ✅ 聚合统计分析
- ✅ RESTful API 接口
- ✅ Swagger API 文档

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 环境配置

创建 `.env` 文件：

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/solana-monitor
SOLANA_RPC=https://api.mainnet-beta.solana.com
MONITOR_WALLETS=wallet1,wallet2
```

### 3. 启动服务

```bash
npm run dev
```

### 4. API 文档

访问 `http://localhost:3000/api-docs`

## API 接口

### 获取最新余额

```
GET /balance/latest?wallet={address}
```

### 获取余额历史

```
POST /balance/history
{
  "wallet": "address",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-02T00:00:00Z",
  "interval": "hourly"
}
```

### 获取聚合数据

```
GET /balance/aggregated?wallet={address}&period=7d
```

## 项目结构

```
src/
├── api/                 # API 层
│   ├── controllers/     # 控制器
│   ├── routes/         # 路由
│   └── server.ts       # 服务器配置
├── collector/          # 数据采集
│   ├── balanceFetcher.ts
│   ├── priceFetcher.ts
│   └── scheduler.ts
├── storage/            # 数据存储
│   ├── models/         # 数据模型
│   └── db.ts          # 数据库连接
├── utils/              # 工具函数
│   ├── logger.ts
│   ├── validator.ts
│   └── errorHandler.ts
└── config/             # 配置
    └── constants.ts
```
