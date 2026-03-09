# 📦 设计资源包

**项目：** 研发费用合规智能管理系统  
**更新时间：** 2026-03-09

---

## 📸 需要的图片资源

请将以下图片放在 `src/assets/images/` 目录：

### 1. 系统 Logo

**用途：** 登录页、侧边栏顶部  
**格式：** SVG（推荐）或 PNG（透明背景）  
**尺寸：** 
- SVG：任意（矢量）
- PNG：96x96 或 128x128

**当前状态：** 使用内联 SVG 临时替代

**放置位置：**
```
src/assets/images/logo.svg
```

**引用方式：**
```vue
<img src="@/assets/images/logo.svg" alt="Logo" />
```

---

### 2. 登录页插画

**用途：** 登录页左侧品牌区  
**格式：** PNG 或 JPG  
**尺寸：** 280x200 像素  
**风格：** 简洁、现代、商务

**当前状态：** 使用 CSS 绘制的简单图形（山 + 太阳）

**放置位置：**
```
src/assets/images/login-illustration.png
```

**引用方式：**
```vue
<img src="@/assets/images/login-illustration.png" alt="插画" class="brand-image" />
```

---

## 🎨 设计规范参考

### 颜色

```scss
// 主色
$primary: #272b30;        // 深灰黑
$success: #0d9f5f;        // 绿色
$warning: #d48806;        // 黄色
$danger: #c2185b;         // 粉色

// 背景
$bg-primary: #fcfcfc;     // 主背景
$bg-secondary: #f4f4f4;   // 次级背景

// 文字
$text-primary: #272b30;   // 主文字
$text-secondary: #6f767e; // 次级文字
$text-hint: #9a9fa5;      // 提示文字
```

### 圆角

- 卡片：`16px`
- 按钮/输入框：`8-10px`
- 图标容器：`10-12px`

### 阴影

```scss
box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
```

---

## 📥 如何提供图片

你可以：

1. **直接发送图片文件** - 我会帮你放到正确的位置
2. **提供 Figma 设计稿链接** - 我可以从中导出
3. **使用现有图片** - 告诉我文件名和位置

---

## 🖼️ 当前临时方案

### Logo（内联 SVG）

当前登录页和侧边栏使用的临时 SVG：

```svg
<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
  <path d="M4 24C4 12.9543 12.9543 4 24 4V4C35.0457 4 44 12.9543 44 24V24C44 35.0457 35.0457 44 24 44V44C12.9543 44 4 35.0457 4 24V24Z" fill="#272B30"/>
  <rect x="14" y="20" width="4" height="8" rx="2" fill="white"/>
  <rect x="22" y="18" width="4" height="12" rx="2" fill="url(#grad1)"/>
  <rect x="30" y="20" width="4" height="8" rx="2" fill="white"/>
  <defs>
    <linearGradient id="grad1" x1="24" y1="18" x2="24" y2="30" gradientUnits="userSpaceOnUse">
      <stop stop-color="white"/>
      <stop offset="1" stop-color="#D0D0D0"/>
    </linearGradient>
  </defs>
</svg>
```

### 插画（CSS 绘制）

当前登录页使用 CSS 绘制的简单插画：
- 渐变背景
- 山形（橙色渐变）
- 太阳（黄色圆形）

---

## 📁 目录结构

创建以下目录结构：

```
frontend/
└── src/
    └── assets/
        ├── images/
        │   ├── logo.svg              ← 放这里
        │   └── login-illustration.png ← 放这里
        └── icons/                    ← 可选，自定义图标
```

---

## 🔧 替换图片后的操作

1. 将图片放到 `src/assets/images/` 目录
2. 修改对应的 Vue 组件：
   - `views/Login/index.vue` - 替换 Logo 和插画
   - `layouts/MainLayout.vue` - 替换 Logo
3. 重新编译：`npm run dev`

---

## 💡 建议

### Logo 设计建议

- 简洁易识别
- 适合深色和浅色背景
- 考虑方形和横向两种版本
- 避免过多细节（小尺寸时会模糊）

### 插画风格建议

- 与 Logo 风格一致
- 使用品牌色系
- 简洁现代
- 避免过于复杂的细节
- 考虑响应式（可能需要不同尺寸版本）

---

**整理时间：** 2026-03-09  
**整理者：** AI Assistant (ClawEn) 🤖
