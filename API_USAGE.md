# Solana 钱包余额 API 使用说明

## 概述

本项目提供了两种获取钱包余额的 API 接口：

1. **完整余额接口** (`/api/balance/wallet`) - 包含实时价格和 USD 价值
2. **纯余额接口** (`/api/balance/wallet-only`) - 只包含余额数据，不依赖外部价格 API

## API 接口

### 1. 完整余额接口（推荐）

**端点**: `GET /api/balance/wallet`

**参数**:

- `wallet` (必需): 钱包地址

**示例**:

```bash
curl "http://localhost:3000/api/balance/wallet?wallet=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
```

**响应**:

```json
{
  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "solBalance": 1.5,
  "tokenBalances": [
    {
      "symbol": "SOL",
      "name": "Solana",
      "balance": 1.5,
      "price": 150.25,
      "usdValue": 225.375,
      "color": "#9945FF"
    },
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "balance": 100.0,
      "price": 1.0,
      "usdValue": 100.0,
      "color": "#2775CA"
    }
  ],
  "totalUsdValue": 325.375,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

**特点**:

- ✅ 包含实时价格数据（通过免费的 CoinGecko API）
- ✅ 自动计算 USD 价值
- ✅ 支持价格缓存（5 分钟）
- ✅ 有容错机制，API 失败时使用默认价格

### 2. 纯余额接口

**端点**: `GET /api/balance/wallet-only`

**参数**:

- `wallet` (必需): 钱包地址

**示例**:

```bash
curl "http://localhost:3000/api/balance/wallet-only?wallet=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
```

**响应**:

```json
{
  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "solBalance": 1.5,
  "tokenBalances": [
    {
      "symbol": "SOL",
      "name": "Solana",
      "balance": 1.5,
      "decimals": 9,
      "address": "So11111111111111111111111111111111111111112",
      "color": "#9945FF"
    },
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "balance": 100.0,
      "decimals": 6,
      "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "color": "#2775CA"
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

**特点**:

- ✅ 只依赖 Solana RPC，不调用外部 API
- ✅ 响应速度更快
- ✅ 更稳定，不依赖网络连接
- ❌ 不包含价格和 USD 价值

## 前端配置

在前端 `frontend/src/config/index.ts` 中可以配置是否启用价格数据：

```typescript
export const config = {
  // 是否启用价格数据（需要网络请求）
  enablePriceData: true, // 设为 false 则使用纯余额接口

  // 默认价格（当API不可用时使用）
  defaultPrices: {
    SOL: 150.0,
    USDC: 1.0,
    USDT: 1.0,
    BONK: 0.00002,
    JUP: 0.5,
  },
  // ... 其他配置
};
```

## 使用建议

### 选择完整余额接口的情况：

- 需要显示 USD 价值
- 需要资产分布图表
- 网络环境稳定
- 对价格准确性要求较高

### 选择纯余额接口的情况：

- 只需要查看余额数量
- 网络环境不稳定
- 希望减少外部依赖
- 对响应速度要求较高

## 错误处理

两个接口都有完善的错误处理机制：

1. **网络错误**: 自动重试，使用默认价格
2. **RPC 错误**: 返回错误信息
3. **无效地址**: 返回 400 错误
4. **超时处理**: 10 秒超时，避免长时间等待

## 性能优化

1. **价格缓存**: 5 分钟缓存，减少 API 调用
2. **并行请求**: 余额和价格并行获取
3. **错误降级**: API 失败时使用默认价格
4. **超时控制**: 避免长时间等待

## 支持的代币

目前支持以下代币：

- SOL (Solana)
- USDC (USD Coin)
- USDT (Tether USD)
- BONK (Bonk)
- JUP (Jupiter)

可以通过修改后端代码添加更多代币支持。
