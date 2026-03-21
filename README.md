# 研发费用合规智能管理系统 - 前端

## 📦 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6.x
- **UI 组件库**: shadcn/ui (Radix UI) + Tailwind CSS 4.x
- **路由**: React Router 7.x
- **图标**: Lucide React
- **动画**: Motion (Framer Motion)

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建打包
```bash
pnpm build
```

## 📂 项目结构

```
src/
├── app/
│   ├── components/       # 公共组件
│   │   ├── ui/           # shadcn/ui 组件
│   │   └── figma/        # Figma 相关组件
│   ├── pages/            # 页面组件
│   │   ├── HomePage.tsx          # 工作台
│   │   ├── PersonnelPage.tsx     # 人员管理
│   │   ├── EquipmentPage.tsx     # 设备管理
│   │   ├── AttendancePage.tsx    # 打卡记录
│   │   ├── ProjectListPage.tsx   # 项目列表
│   │   ├── CreateProjectPage.tsx # 创建项目
│   │   ├── PendingSettlementPage.tsx # 待结算
│   │   ├── OperationLogPage.tsx  # 操作日志
│   │   └── AccountPage.tsx       # 账号管理
│   ├── routes.ts         # 路由配置
│   └── App.tsx           # 根组件
├── main.tsx              # 入口文件
├── styles/               # 全局样式
└── assets/               # 静态资源
```

## 🎨 设计规范

### 色彩系统
- **主色**: #272b30 (深灰黑)
- **成功**: #52c41a (绿色)
- **警告**: #faad14 (橙色)
- **错误**: #ff4d4f (红色)
- **信息**: #1890ff (蓝色)

### 布局
- **侧边栏**: 260px
- **内容间距**: 24px
- **圆角**: 12px (卡片), 8px (按钮/输入框)

## 📝 页面清单

| 页面 | 路径 | 状态 |
|------|------|------|
| 工作台 | / | ✅ |
| 人员管理 | /personnel | ✅ |
| 设备管理 | /equipment | ✅ |
| 打卡记录 | /attendance | ✅ |
| 项目列表 | /projects | ✅ |
| 创建项目 | /projects/create | ✅ |
| 待结算项目 | /projects/pending-settlement | ✅ |
| 操作日志 | /operation-log | ✅ |
| 账号管理 | /accounts | ✅ |

## 🛠️ 开发注意事项

1. **组件风格**: 使用 Tailwind CSS + 自定义样式
2. **组件库**: 优先使用 shadcn/ui 组件
3. **图标**: 使用 Lucide React
4. **动画**: 使用 Motion 库

## 📦 分支说明

- **OpenClaw**: Vue 版本（已弃用）
- **claw-react**: React 版本（当前开发分支）

## 📖 相关文档

- [设计稿资源](./DESIGN_RESOURCES.md)
- [开发进度](./DEVELOPMENT_PROGRESS.md)
- [自查清单](./CHECKLIST.md)

---

**版本**: 2.0.0  
**更新日期**: 2026-03-15  
**技术栈变更**: Vue → React + Tailwind + shadcn/ui