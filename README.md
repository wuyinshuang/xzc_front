<p align="center">
	<img alt="logo" src="https://oscimg.oschina.net/oscnet/up-d3d0a9303e11d522a06cd263f3079027715.png">
</p>
<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">鑫智策定价系统 v3.9.2</h1>
<h4 align="center">信贷产品智能定价决策系统 - 基于 SpringBoot + Vue3 前后端分离架构</h4>
<p align="center">
	<a href="https://gitee.com/y_project/RuoYi-Vue/stargazers"><img src="https://gitee.com/y_project/RuoYi-Vue/badge/star.svg?theme=dark"></a>
	<a href="https://gitee.com/y_project/RuoYi-Vue"><img src="https://img.shields.io/badge/RuoYi-v3.9.2-brightgreen.svg"></a>
	<a href="https://gitee.com/y_project/RuoYi-Vue/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg"></a>
</p>

## 平台简介

* 本系统是基于 RuoYi-Vue3 框架二次开发的 **鑫智策定价系统**，专注于信贷产品的智能定价决策。
* 前端技术栈：[Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev) + [Pinia](https://pinia.vuejs.org) + [ECharts](https://echarts.apache.org/)。
* 配套后端接口地址：`http://47.101.153.130:10066/xzc`（定价系统API）

## 核心功能

### 定价决策模块
1. **仪表盘首页**：定价可视化大屏，实时展示核心定价指标、业务分布、模型状态等
2. **新产品设计定价**：客群筛选、方案生成，支持多维度定价参数配置
3. **定价查询信息**：查询历史定价方案详情
4. **定价参数管理**：管理定价模型参数配置
5. **定价模型管理**：管理定价模型版本和状态

### 定价分析模块
1. **AB测试管理**：创建、启动、暂停、终止AB实验，查看实验指标
2. **回溯验证**：历史数据回溯测试，验证定价模型效果
3. **策略模拟**：模拟不同定价策略的收益和风险
4. **四情景压力测试**：基准/乐观/悲观/极端情景下的净收益率分析

### 营销与客户分析
1. **客户报告查询**：客户画像、分布统计
2. **营销报告查询**：营销效果分析
3. **客户统计摘要**：客户数据汇总统计
4. **风控档位查询**：风险等级分布查询

### 系统管理模块
1. **用户管理**：系统用户配置、角色权限分配
2. **角色管理**：角色菜单权限、数据权限配置
3. **菜单管理**：系统菜单、操作权限、按钮权限
4. **部门管理**：组织架构配置，树结构展现
5. **字典管理**：系统固定数据维护
6. **参数管理**：系统动态参数配置
7. **通知公告**：系统公告发布

### 系统监控模块
1. **在线用户**：活跃用户状态监控
2. **操作日志**：系统操作日志记录与查询
3. **登录日志**：登录日志记录与异常查询
4. **服务监控**：CPU、内存、磁盘等资源监控
5. **缓存监控**：缓存信息查询与命令统计
6. **定时任务**：任务调度与执行日志

### 智能辅助
1. **AI对话**：集成AI助手，提供智能问答支持
2. **代码生成**：前后端代码自动生成
3. **在线构建器**：可视化表单设计

## 技术架构

### 前端技术栈
| 技术 | 版本 | 说明 |
| :--- | :--- | :--- |
| Vue | 3.5.26 | 渐进式JavaScript框架 |
| Element Plus | 2.13.1 | 企业级Vue3组件库 |
| Vite | 6.4.1 | 下一代前端构建工具 |
| Pinia | 3.0.4 | Vue状态管理库 |
| Vue Router | 4.6.4 | Vue路由管理 |
| ECharts | 5.6.0 | 数据可视化图表库 |
| Axios | 1.13.2 | HTTP客户端 |
| Sass | 1.97.2 | CSS预处理器 |

### 版本对比
RuoYi-Vue 前端项目的三个主要演进版本对比：

| 项目名称      | **RuoYi-Vue** | **RuoYi-Vue3** | **RuoYi-Vue3-TypeScript**   |
| :---          | :---          | :---           | :---                        |
| **前端框架**  | Vue 2        | Vue 3          | Vue 3                       |
| **脚本语言**  | JavaScript   | JavaScript     | TypeScript                  |
| **构建工具**  | Vue CLI      | Vite           | Vite                        |
| **UI 组件库** | Element UI   | Element Plus   | Element Plus                |
| **状态管理**  | Vuex         | Pinia          | Pinia                       |
| **路由管理**  | Vue Router 3 | Vue Router 4   | Vue Router 4                |
| **核心特点**  | 技术栈经典稳定<br>社区资料丰富 | 现代前端技术栈<br>开发体验与性能更优 | 类型加持<br>多人协作更规范 |

## 快速开始

### 环境要求
- Node.js >= 16.x
- npm >= 8.x 或 yarn >= 1.22

### 安装与运行

```bash
# 1. 克隆项目
git clone <repository-url>

# 2. 进入项目目录
cd RuoYi-Vue3

# 3. 安装依赖（推荐使用国内镜像）
yarn --registry=https://registry.npmmirror.com

# 4. 启动开发服务
yarn dev

# 5. 构建测试环境
yarn build:stage

# 6. 构建生产环境
yarn build:prod

# 7. 预览生产构建
yarn preview
```

### 配置说明

#### 环境变量
- `.env.development`：开发环境配置
  - `VITE_APP_TITLE`：系统标题（默认：鑫智策定价系统）
  - `VITE_APP_BASE_API`：若依后端API前缀（默认：`/dev-api`）
  - `VITE_APP_XZC_API`：定价系统API前缀（默认：`/xzc`）

#### Vite代理配置
开发环境通过 Vite 代理转发请求：
- `/dev-api` → `http://localhost:8080`（若依后端）
- `/xzc` → `http://47.101.153.130:10066`（定价系统API）
- 端口：`8082`

### 部署说明

#### 生产环境构建
```bash
yarn build:prod
```

#### Nginx配置示例
```nginx
server {
    listen 8082;
    server_name localhost;
    
    # 前端静态文件
    location / {
        root /path/to/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 若依后端API代理
    location /dev-api/ {
        proxy_pass http://localhost:8080/;
    }
    
    # 定价系统API代理
    location /xzc/ {
        proxy_pass http://47.101.153.130:10066/;
    }
}
```

## 项目结构

```
RuoYi-Vue3/
├── src/
│   ├── api/                    # API接口
│   │   ├── ai/                # AI对话接口
│   │   ├── custom/            # 自定义业务接口
│   │   ├── info/              # 信息查询接口
│   │   ├── monitor/           # 监控接口
│   │   ├── price/             # 定价系统接口
│   │   ├── system/            # 系统管理接口
│   │   └── xzc.js             # 定价系统axios实例
│   ├── components/            # 公共组件
│   ├── layout/                # 布局组件
│   ├── router/                # 路由配置
│   ├── store/                 # Pinia状态管理
│   ├── utils/                 # 工具函数
│   └── views/                 # 页面视图
│       ├── about/             # 关于页面
│       ├── ai/                # AI对话页面
│       ├── info/              # 信息查询页面
│       ├── monitor/           # 监控页面
│       ├── price/             # 定价系统页面
│       ├── system/            # 系统管理页面
│       ├── tool/              # 工具页面
│       └── index.vue          # 仪表盘首页
├── public/                     # 静态资源
├── vite/                       # Vite插件配置
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── vite.config.js             # Vite配置
└── package.json               # 项目配置
```

## API接口说明

### 定价系统API（/xzc）
基于 RESTful 风格，主要接口包括：

| 模块 | 接口路径 | 说明 |
| :--- | :--- | :--- |
| 产品设计 | `/api/pricing/product-design` | 生成产品设计方案 |
| AB测试 | `/api/admin/abtest` | 创建/查询/管理AB实验 |
| 回溯验证 | `/api/admin/backtest/validate` | 触发回溯验证 |
| 定价调整 | `/api/admin/backtest/adjustments` | 查询/应用/回滚定价调整 |

### 若依系统API（/dev-api）
标准若依后台管理接口，详见官方文档。

## 开发指南

### 代码规范
- 组件命名：PascalCase
- 事件命名：camelCase
- 常量命名：UPPER_SNAKE_CASE
- 样式使用 scoped 避免污染

### 新增页面
1. 在 `src/views/` 下创建页面组件
2. 在 `src/api/` 下创建对应API文件
3. 在路由配置中添加页面路由（或通过后台菜单管理动态添加）

### 新增API
1. 在对应模块的 `src/api/` 文件中添加接口方法
2. 定价系统API使用 `xzcService`（来自 `src/api/xzc.js`）
3. 若依系统API使用 `request`（来自 `@/utils/request`）

## 在线体验

- 演示地址：`http://localhost:8082`
- 默认账号：`admin` / `admin123`

## 常见问题

### Q: 如何切换定价系统API地址？
修改 `.env.development` 中的 `VITE_APP_XZC_API` 和 `vite.config.js` 中的代理配置。

### Q: 如何解决跨域问题？
开发环境已通过 Vite 代理解决跨域。生产环境需在 Nginx 中配置反向代理。

### Q: 定价接口返回数据如何处理？
定价系统API可能返回多层包装结构，前端已做兼容处理。如遇问题请查看浏览器控制台日志。

## 开源协议

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

## 致谢

- [若依框架](https://gitee.com/y_project/RuoYi-Vue) - 提供了优秀的后台管理框架基础
- [Element Plus](https://element-plus.org) - 提供了丰富的Vue3组件库
