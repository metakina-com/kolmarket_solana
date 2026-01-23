# 🎨 颜色使用规范

**最后更新**: 2025-01-22  
**目标**: 确保全站色调一致，使用统一的主题变量

---

## 📋 一、主题变量系统

### 1.1 核心颜色变量

所有颜色应使用 CSS 变量（通过 Tailwind 主题系统）：

| 用途 | 变量名 | Tailwind 类 | 说明 |
|------|--------|------------|------|
| **背景** | `--background` | `bg-background` | 页面主背景 |
| **前景** | `--foreground` | `text-foreground` | 主要文字颜色 |
| **卡片** | `--card` | `bg-card` | 卡片背景 |
| **边框** | `--border` | `border-border` | 边框颜色 |
| **次要文字** | `--muted-foreground` | `text-muted-foreground` | 次要文字 |
| **次要背景** | `--muted` | `bg-muted` | 次要背景 |

### 1.2 强调色

| 颜色 | 用途 | Tailwind 类 | 说明 |
|------|------|------------|------|
| **Cyan** | 主要强调色 | `bg-cyan-500`, `text-cyan-400` | 按钮、链接、高亮 |
| **Purple** | 次要强调色 | `bg-purple-500`, `text-purple-400` | 辅助元素 |
| **Green** | 成功/正面 | `bg-green-500/20`, `text-green-400` | 成功状态 |
| **Red** | 错误/警告 | `bg-red-500/20`, `text-red-400` | 错误状态 |

---

## ✅ 二、正确用法

### 2.1 背景色

```tsx
// ✅ 正确
<div className="bg-background">...</div>
<div className="bg-card">...</div>
<div className="bg-card/50">...</div>  // 半透明
<div className="bg-muted">...</div>

// ❌ 错误
<div className="bg-[#020617]">...</div>
<div className="bg-slate-900">...</div>
<div className="bg-slate-800">...</div>
```

### 2.2 文字颜色

```tsx
// ✅ 正确
<p className="text-foreground">主要文字</p>
<p className="text-muted-foreground">次要文字</p>
<p className="text-cyan-400">强调文字</p>

// ❌ 错误
<p className="text-white">...</p>
<p className="text-slate-400">...</p>
<p className="text-slate-500">...</p>
```

### 2.3 边框颜色

```tsx
// ✅ 正确
<div className="border border-border">...</div>
<div className="border border-cyan-500/30">...</div>  // 强调边框

// ❌ 错误
<div className="border border-white/5">...</div>
<div className="border border-slate-700">...</div>
```

### 2.4 强调色使用

```tsx
// ✅ 正确
<button className="bg-cyan-500 text-slate-950">...</button>
<div className="bg-cyan-500/10 border border-cyan-500/30">...</div>
<span className="text-cyan-400">...</span>

// ❌ 错误
<button className="bg-blue-500">...</button>  // 不使用蓝色
```

---

## ❌ 三、禁止用法

### 3.1 硬编码颜色

**禁止使用**:
- `bg-[#020617]` - 应使用 `bg-background`
- `bg-slate-800`, `bg-slate-900` - 应使用 `bg-card` 或 `bg-muted`
- `text-white` - 应使用 `text-foreground`
- `text-slate-400`, `text-slate-500` - 应使用 `text-muted-foreground`
- `border-white/5`, `border-white/10` - 应使用 `border-border`

### 3.2 不一致的颜色

**禁止混用**:
- 不要在同一组件中混用主题变量和硬编码颜色
- 不要使用非主题色（如 `blue-500`, `indigo-500` 等）

---

## 🎯 四、特殊场景

### 4.1 半透明背景

```tsx
// ✅ 正确
<div className="bg-card/50">...</div>      // 50% 透明度
<div className="bg-card/80">...</div>      // 80% 透明度
<div className="bg-cyan-500/10">...</div>  // 强调色 10% 透明度
```

### 4.2 强调边框

```tsx
// ✅ 正确
<div className="border border-cyan-500/30">...</div>
<div className="border border-purple-500/20">...</div>
<div className="hover:border-cyan-500/40">...</div>
```

### 4.3 按钮样式

```tsx
// ✅ 主要按钮
<button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">...</button>

// ✅ 次要按钮
<button className="bg-muted text-foreground hover:bg-muted/80">...</button>

// ✅ 文字按钮
<button className="text-foreground hover:text-cyan-400">...</button>
```

---

## 🔍 五、检查清单

在提交代码前，检查：

- [ ] 没有使用 `bg-[#020617]` 或类似的硬编码颜色
- [ ] 没有使用 `bg-slate-*` 系列（除非是强调色如 `bg-cyan-500`）
- [ ] 没有使用 `text-white` 或 `text-slate-*`
- [ ] 没有使用 `border-white/*` 或 `border-slate-*`
- [ ] 所有背景色使用 `bg-background`, `bg-card`, `bg-muted`
- [ ] 所有文字颜色使用 `text-foreground`, `text-muted-foreground`
- [ ] 所有边框使用 `border-border` 或强调色边框

---

## 📝 六、快速替换参考

| 旧代码 | 新代码 |
|-------|-------|
| `bg-[#020617]` | `bg-background` |
| `bg-slate-900` | `bg-card` |
| `bg-slate-800` | `bg-muted` |
| `bg-slate-900/50` | `bg-card/50` |
| `text-white` | `text-foreground` |
| `text-slate-400` | `text-muted-foreground` |
| `text-slate-500` | `text-muted-foreground` |
| `border-white/5` | `border-border` |
| `border-white/10` | `border-border` |
| `border-slate-700` | `border-border` |

---

## 🎨 七、Cyberpunk 主题配色

### 主色调

- **背景**: 深色 (`bg-background` = `#020617`)
- **强调色**: Cyan (`#06b6d4`) 和 Purple (`#a855f7`)
- **文字**: 浅色 (`text-foreground`)

### 配色方案

```
背景层:
- bg-background (主背景)
- bg-card (卡片背景)
- bg-card/50 (半透明卡片)

文字层:
- text-foreground (主要文字)
- text-muted-foreground (次要文字)
- text-cyan-400 (强调文字)

边框层:
- border-border (默认边框)
- border-cyan-500/30 (强调边框)
```

---

**最后更新**: 2025-01-22
