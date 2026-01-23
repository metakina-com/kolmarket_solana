# KMT 元数据下一步操作

完成 **R2 上传** 后，按以下步骤将元数据提交到 Solana 链上。

---

## 当前进度

- [x] **R2 上传**：`kmt-metadata.json` 已上传到  
  `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`
- [ ] **链上提交**：待设置 `TOKEN_MINT` 和私钥后执行

---

## 1. 准备环境变量

### 若尚未创建 KMT 代币

```bash
export SOLANA_DEVNET_PRIVATE_KEY=your_64_byte_hex  # 或 SOLANA_PRIVATE_KEY
npm run create:token
```

脚本会输出 **Mint 地址**，保存到 `token-info-devnet.json`。

### 若已有 KMT Mint 地址

```bash
# 必需
export TOKEN_MINT=你的KMT_Mint地址
export SOLANA_DEVNET_PRIVATE_KEY=你的私钥十六进制

# 可选（已上传 R2 且存在 kmt-metadata-r2-upload.json 时会自动读取）
export TOKEN_URI="https://oss.kolmarket.ai/token-metadata/kmt-metadata.json"
```

---

## 2. 提交元数据到链上

```bash
npm run upload:metadata
```

脚本会：

1. 使用 `TOKEN_MINT`、`SOLANA_DEVNET_PRIVATE_KEY`
2. 自动从 `kmt-metadata-r2-upload.json` 读取 `TOKEN_URI`（若未设置 env）
3. 创建/更新 Metaplex 元数据账户
4. 输出 Solana Explorer 链接

---

## 3. 验证

在浏览器打开脚本输出的 Explorer 链接，确认：

- **Metadata** 账户已创建
- **Name**: KOLMARKET TOKEN  
- **Symbol**: KMT  
- **URI**: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`

打开 URI 可验证 JSON 与图片是否正常。

---

## 4. 常用命令速查

| 步骤 | 命令 |
|------|------|
| 上传元数据到 R2 | `R2_CUSTOM_DOMAIN=oss.kolmarket.ai npm run upload:r2` |
| 创建 Devnet 代币 | `npm run create:token` |
| 提交元数据到链上 | `npm run upload:metadata` |

---

## 5. 故障排查

### `TOKEN_MINT` 未设置

- 先执行 `npm run create:token` 获取 Mint，或从 `token-info-devnet.json` 读取。
- 再设置 `export TOKEN_MINT=...` 后重新运行 `npm run upload:metadata`。

### `SOLANA_DEVNET_PRIVATE_KEY` 未设置

- 使用创建代币的同一钱包私钥（64 字节 hex）。
- 设置 `export SOLANA_DEVNET_PRIVATE_KEY=...` 或 `SOLANA_PRIVATE_KEY`（JSON 数组格式）。

### `TOKEN_URI` 未设置且无 R2 记录

- 先运行 `npm run upload:r2` 生成 `kmt-metadata-r2-upload.json`。
- 或手动设置 `export TOKEN_URI="https://oss.kolmarket.ai/token-metadata/kmt-metadata.json"`。

---

**相关文档**：[上传元数据到链上](./UPLOAD_METADATA_TO_BLOCKCHAIN.md) · [KMT 元数据设置](./KMT_METADATA_SETUP.md) · [R2 存储](./R2_STORAGE_COMPLETE.md)
