# Solana Token Extensions 说明

**Token Extensions**（代币扩展）是 Solana 的 **Token-2022** 程序提供的可选功能，在标准 SPL Token 基础上增加转账费、元数据、分组、隐私等能力。

---

## 是什么？

- **程序**: Token-2022（`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`）
- **基础**: 标准 SPL Token 的升级版
- **用法**: 创建代币时按需启用一种或多种扩展，之后一般不可再添加

---

## 主要扩展类型

### 一、铸造 / Mint 相关

| 扩展 | 说明 |
|------|------|
| **TransferFeeConfig** | 转账手续费：可按比例收 fee，分配给指定地址 |
| **MintCloseAuthority** | 铸造关闭权限：指定谁可以关闭 mint、收回 rent |
| **DefaultAccountState** | 默认账户状态：新账户默认冻结或默认激活 |
| **NonTransferable** | 不可转让：代币只能铸造/销毁，不能转账（如成就、徽章） |
| **InterestBearingConfig** | 利息配置：代币可配置利率，随时间 accrual |
| **PermanentDelegate** | 永久委托人：指定地址始终可代表用户转移/冻结代币 |
| **TransferHook** | 转账钩子：每次转账前调用自定义程序做校验、风控等 |
| **MetadataPointer** | 元数据指针：mint 指向链上元数据账户 |
| **TokenMetadata** | 链上元数据：名称、符号、URI 等直接存在链上 |
| **TokenGroup / TokenGroupMember** | 代币分组：一组代币 + 成员关系，便于合集/系列 |
| **ConfidentialMintBurn** | 隐私铸造/销毁：隐藏铸造与销毁数量 |
| **ScaledUiAmount** | UI 数量缩放：自定义展示用的精度/倍数 |
| **Pausable** | 可暂停：指定权限可暂停转账等操作 |

### 二、账户 / 持有者相关

| 扩展 | 说明 |
|------|------|
| **ImmutableOwner** | 账户所有者不可变：防止通过关联账户升级等方式篡改 owner |
| **MemoTransfer** | 必须带 Memo：转账时必须附上备注，便于合规/审计 |
| **CpiGuard** | CPI 保护：限制该代币账户被其他程序通过 CPI 操作 |
| **ConfidentialTransfer** | 隐私转账：转账金额加密，仅接收方等授权方可知 |

---

## 常见用途

- **收费代币**: 用 **TransferFeeConfig** 做每笔转账抽成
- **灵魂绑定 / 成就**: 用 **NonTransferable** 做不可转的代币
- **链上元数据 / Logo**: 用 **TokenMetadata** 或 **MetadataPointer** 存名称、符号、URI
- **NFT 系列 / 合集**: 用 **TokenGroup** + **TokenGroupMember**
- **合规 / 风控**: 用 **TransferHook**、**MemoTransfer**、**Pausable**
- **隐私**: 用 **ConfidentialTransfer**、**ConfidentialMintBurn**

---

## 与 KMT 的关系

当前 **KMT** 使用的是 **经典 SPL Token**（`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`），通过 **Metaplex Token Metadata** 存名称、符号、URI、Logo 等。

若要让 KMT 使用 Token Extensions：

1. 改用 **Token-2022** 程序重新创建 mint  
2. 创建时启用需要的扩展（例如 **TokenMetadata** 或 **MetadataPointer**）  
3. 元数据需按 Token-2022 的格式写入

这样 KMT 会同时具备「扩展功能」和「链上元数据 / Logo」。

---

## 参考资料

- [Solana 官方 - Extensions](https://solana.com/docs/tokens/extensions)
- [SPL Token-2022 扩展](https://spl.solana.com/token-2022/extensions)
- [Token Extensions 概览](https://www.tokenextensions.xyz/)

---

**Token-2022 程序 ID**: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
