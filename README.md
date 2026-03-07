# 研发项目资金合规管理系统 - 前端

## 📦 技术栈

- **框架**: Vue 3.4 + TypeScript
- **构建工具**: Vite 5.x
- **UI 组件库**: Element Plus 2.x
- **状态管理**: Pinia 2.x (+ 持久化插件)
- **路由**: Vue Router 4.x
- **HTTP 请求**: Axios 1.x
- **桌面应用**: Electron 28.x

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 仅运行前端（浏览器）
npm run dev

# 运行 Electron 桌面应用
npm run electron:dev
```

### 构建打包
```bash
# 构建前端
npm run build

# 构建 Electron 应用
npm run electron:build
```

## 📂 项目结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── layouts/          # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── styles/           # 全局样式
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.ts           # 入口文件

electron/
├── main.js           # Electron 主进程
└── preload.js        # 预加载脚本
```

## 🎨 设计规范

### 色彩系统
- **主色**: #2563EB (科技蓝)
- **成功**: #10B981 (绿色)
- **警告**: #F59E0B (橙色)
- **错误**: #EF4444 (红色)

### 布局
- **侧边栏**: 240px
- **顶部栏**: 60px
- **内容间距**: 24px

## 🔐 默认账号

- 用户名：admin
- 密码：admin123

## 📝 开发进度

### 已完成
- ✅ 项目基础结构
- ✅ Electron 集成
- ✅ 登录/登出功能
- ✅ 主布局框架
- ✅ 工作台页面
- ✅ API 封装
- ✅ 状态管理

### 待开发
- ⏭️ 员工管理页面
- ⏭️ 设备管理页面
- ⏭️ 项目管理页面
- ⏭️ 项目结算页面
- ⏭️ 操作日志页面

## 🛠️ 开发注意事项

1. **TypeScript**: 所有代码必须使用 TypeScript
2. **组件命名**: 使用 PascalCase（如 `ProjectList.vue`）
3. **API 调用**: 统一使用 `src/utils/request.ts` 封装的方法
4. **状态管理**: 全局状态使用 Pinia
5. **样式**: 使用 SCSS，变量定义在 `variables.scss`

## 📦 打包发布

Windows 安装包生成位置：`dist-electron/`

## 📖 相关文档

- [后端 API 文档](../backend/README.md)
- [数据库设计](../backend/数据库设计文档.md)
- [功能需求文档](../研发项目资金合规管理 - 开发功能文档 2.0.docx)

---

**版本**: 1.0.0  
**更新日期**: 2026-03-07
