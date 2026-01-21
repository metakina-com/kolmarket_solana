# Cookie.fun API 快速开始

## 🚀 快速配置指南

### 步骤 1: 注册账户

打开浏览器访问: **[https://app.cookie3.co](https://app.cookie3.co)** ⭐

1. 点击 **"Sign Up"** 注册新账户
2. 完成账户创建和基础设置
3. 进入 Dashboard（仪表板）

### 步骤 2: 完成 Onboarding Call

**重要**: 这是获取 API 访问权限的关键步骤

1. 联系 Cookie3 的销售/商务团队
2. 完成 **Onboarding Call（入职会议）**
3. 说明你的项目需求：
   - 项目: KOLMarket.ai
   - 用途: KOL Mindshare Index 数据展示和分析
   - 预期使用量
4. 完成 onboarding call 后可以申请免费试用

### 步骤 3: 申请 API Key

1. 在 Dashboard 中查找 **"API"** 或 **"Developer"** 入口
2. 填写 API 申请表单
3. 等待审核（通常 1-3 个工作日）

### 步骤 3: 获取 API Key

审核通过后，你会收到：
- API Key（类似: `ck_live_xxxxxxxxxxxxx`）
- API 端点 URL
- Rate Limit 信息

### 步骤 4: 配置到项目

在项目根目录创建 `.env.local` 文件：

```bash
# Cookie.fun API 配置
NEXT_PUBLIC_COOKIE_FUN_API_URL=https://api.cookie.fun
COOKIE_FUN_API_KEY=你的API_KEY
```

### 步骤 5: 测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 查看 KOL 卡片是否显示真实数据
```

## ⚡ 无 API Key 也能使用

即使没有 API Key，项目也能正常工作：
- ✅ 使用 Mock 数据作为降级方案
- ✅ 显示加载状态
- ✅ 不会报错或崩溃

## 📚 更多信息

- **应用平台**: [https://app.cookie3.co](https://app.cookie3.co) ⭐
- **商业版**: [https://www.cookie3.com/business](https://www.cookie3.com/business)
- **详细获取指南**: [HOW_TO_GET_COOKIE_FUN_API.md](./HOW_TO_GET_COOKIE_FUN_API.md)
- **完整集成文档**: [COOKIE_FUN_INTEGRATION.md](./COOKIE_FUN_INTEGRATION.md)
- **官方文档**: [https://docs.cookie.community](https://docs.cookie.community)

## ❓ 常见问题

**Q: 如何开始？**  
A: 访问 [https://app.cookie3.co](https://app.cookie3.co) 注册账户，然后联系销售团队完成 onboarding call。

**Q: Onboarding Call 是必须的吗？**  
A: 是的，完成 onboarding call 后才能申请 API 访问权限和免费试用。

**Q: 申请需要多久？**  
A: Onboarding call 通常可以快速安排，API Key 审核通常 1-3 个工作日。

**Q: 免费吗？**  
A: 完成 onboarding call 后可以申请免费试用。高级功能需要付费订阅。

**Q: 没有 API Key 能开发吗？**  
A: 可以！项目已实现降级方案，使用 Mock 数据，不影响开发。

**Q: API 端点是什么？**  
A: 具体端点会在 Dashboard 的 API 设置页面显示，通常是 `https://api.cookie.fun` 或 Cookie3 特定的端点。
