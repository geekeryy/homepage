# 个人网站前端开发计划

## 一、技术栈和依赖

### UI 框架和工具库

- **UI 组件库**：Element Plus（成熟、功能丰富、文档完善）
- **HTTP 请求**：axios
- **工具库**：dayjs（时间格式化）
- **CSS 方案**：组合使用 Element Plus 主题 + 自定义 CSS
- **图标**：@element-plus/icons-vue
- **Markdown 渲染**：markdown-it 或 marked（用于博客内容）

### 数据方案

- **每日新闻**：使用公开 RSS 源或第三方新闻 API（如天行数据、聚合数据）
- **博客文章**：静态 JSON 数据存储在 `src/data/articles.json`
- **项目作品**：静态 JSON 数据存储在 `src/data/projects.json`
- **个人信息**：静态数据存储在 `src/data/profile.json`

## 二、项目结构

```
src/
├── assets/          # 静态资源（图片、图标等）
├── components/      # 可复用组件
│   ├── common/      # 通用组件
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   └── Loading.vue
│   ├── home/        # 首页专用组件
│   │   ├── HeroSection.vue
│   │   └── FeatureCard.vue
│   ├── news/
│   │   └── NewsCard.vue
│   ├── blog/
│   │   └── ArticleCard.vue
│   └── projects/
│       └── ProjectCard.vue
├── data/            # 静态数据文件
│   ├── articles.json
│   ├── projects.json
│   └── profile.json
├── layouts/         # 布局组件
│   └── MainLayout.vue
├── router/          # 路由配置
│   └── index.ts
├── services/        # API 服务层
│   ├── api.ts
│   ├── news.ts
│   └── data.ts
├── styles/          # 全局样式
│   └── main.css
├── types/           # TypeScript 类型定义
│   └── index.ts
├── views/           # 页面组件
│   ├── HomeView.vue
│   ├── NewsView.vue
│   ├── BlogView.vue
│   ├── BlogDetailView.vue
│   ├── ProjectsView.vue
│   └── AboutView.vue
├── App.vue
└── main.ts
```

## 三、页面设计和功能

### 1. 首页（HomeView.vue）- 网站入口

**设计理念**：作为访客的第一印象，重点是吸引和引导，不直接展示内容

**布局结构**：

- **Hero 区域**（全屏或大幅）
  - 大标题：个人名字或品牌标语
  - 副标题：简短的个人定位（如开发工程师 | 技术博主"）
  - 精美的背景图或动态效果
  - CTA 按钮：引导访客探索更多

- **功能导航卡片区**（网格布局）
  - **每日新闻卡片**：图标 + 标题 + 简短描述 + "查看新闻"按钮
  - **博客文章卡片**：图标 + 标题 + 简短描述 + "阅读博客"按钮
  - **项目作品卡片**：图标 + 标题 + 简短描述 + "查看项目"按钮
  - **关于我卡片**：图标 + 标题 + 简短描述 + "了解更多"按钮
  - 每个卡片设计精美，hover 效果明显，吸引点击

**视觉效果**：

- 现代渐变背景或大图
- 微动画效果（文字渐入、卡片浮动等）
- 简洁有力的排版

### 2. 每日新闻页面（NewsView.vue）

- 新闻列表展示（卡片式布局）
- 每条新闻包含：标题、来源、摘要、发布时间、链接
- 支持分类筛选（科技、财经、娱乐等）
- 分页或无限滚动加载
- 点击新闻卡片跳转到原始新闻链接

### 3. 博客列表（BlogView.vue）

- 文章卡片展示（标题、摘要、标签、日期、封面图）
- 支持按标签筛选
- 支持搜索功能
- 点击进入详情页

### 4. 博客详情（BlogDetailView.vue）

- 文章完整内容展示（Markdown 渲染）
- 文章元信息（作者、日期、标签、阅读时间）
- 文章目录导航（自动生成）
- 上一篇/下一篇导航
- 返回列表按钮

### 5. 项目作品集（ProjectsView.vue）

- 项目卡片网格布局
- 每个项目卡片包含：
  - 项目名称和描述
  - 技术栈标签（Element Plus Tag 组件）
  - 项目截图/封面图
  - GitHub 链接和在线演示链接
- 卡片 hover 效果突出

### 6. 个人简介（AboutView.vue）

**内容结构**：

- 个人头像和基本信息
- 自我介绍文字
- **所在行业和教育背景展示**（时间线）
  - 行业名称和描述
- 技能清单（标签云）

### 8. 主布局（MainLayout.vue）

- **顶部导航栏**（使用 Element Plus Menu）
  - Logo（左侧）
  - 导航菜单（首页、新闻、博客、项目、关于、联系）
  - 响应式设计，移动端汉堡菜单
- **主内容区**：`<router-view>` 带过渡动画

- **底部 Footer**
  - 版权信息
  - 快速链接
  - 社交媒体图标

## 四、设计风格指南

### 配色方案

- **主色调**：Element Plus 默认蓝色（#409EFF）或自定义主题色
- **背景色**：白色（#FFFFFF）+ 浅灰（#F5F7FA）
- **文字色**：深灰（#303133）、常规灰（#606266）、次要灰（#909399）
- **强调色**：成功绿（#67C23A）、警告橙（#E6A23C）

### 布局特点

- 卡片式设计，使用 Element Plus Card 组件
- 充分留白，避免拥挤
- 最大宽度 1200px 居中显示
- 使用 Element Plus 的栅格系统（el-row, el-col）

### 动画效果

- Vue Router 页面切换过渡
- 卡片 hover 效果（阴影加深、轻微上浮）
- 首页 Hero 区的动态效果
- 加载状态使用 Element Plus Skeleton 骨架屏
- 平滑滚动

### 响应式断点（Element Plus 标准）

- xs：< 768px（手机）
- sm：>= 768px（平板）
- md：>= 992px（小屏桌面）
- lg：>= 1200px（桌面）
- xl：>= 1920px（大屏）

## 五、数据结构示例

### articles.json

```json
[
  {
    "id": 1,
    "title": "Vue 3 组合式 API 最佳实践",
    "summary": "深入探讨 Vue 3 组合式 API 的使用技巧和最佳实践",
    "content": "# 标题\n\n完整的 Markdown 内容...",
    "cover_image": "/images/articles/vue3.jpg",
    "tags": ["Vue", "TypeScript", "前端"],
    "created_at": "2025-01-01",
    "reading_time": "8 分钟"
  }
]
```

### projects.json

```json
[
  {
    "id": 1,
    "name": "个人博客系统",
    "description": "基于 Vue 3 和 Golang 构建的博客平台",
    "tech_stack": ["Vue 3", "Golang", "PostgreSQL", "Docker"],
    "image_url": "/images/projects/blog.png",
    "github_url": "https://github.com/username/blog",
    "demo_url": "https://blog.example.com"
  }
]
```

### profile.json

```json
{
  "name": "张三",
  "title": "工程师",
  "industry": "互联网/软件开发",
  "bio": "专注于 Web 开发，热爱开源和技术分享。擅长 Vue、React、Golang 等技术栈。",
  "avatar": "/images/avatar.jpg",
  "skills": [
    { "name": "Vue.js", "level": 90 },
    { "name": "Golang", "level": 85 },
    { "name": "TypeScript", "level": 88 },
    { "name": "Docker", "level": 80 }
  ],
  "education": "计算机科学本科",
  "social": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "https://twitter.com/username",
    "email": "your@email.com"
  }
}
```

## 六、开发步骤

### 阶段一：基础搭建

1. **安装项目依赖**：Element Plus、@element-plus/icons-vue、axios、dayjs、markdown-it
2. **创建项目目录结构**：components、views、layouts、services、types、data、styles 等
3. **定义 TypeScript 类型接口**：News、Article、Project、Profile 等

### 阶段二：数据和服务层

4. **创建静态数据文件**：articles.json、projects.json、profile.json 并填充示例数据
5. **创建服务层**：axios 实例配置、新闻 API、数据加载服务

### 阶段三：布局和路由

6. **开发主布局**：MainLayout、Header（导航栏）、Footer 组件
7. **配置完整路由**：7个页面路由 + 过渡动画

### 阶段四：首页开发

8. **开发首页 Hero 区**：大标题、副标题、背景效果、CTA 按钮
9. **开发首页功能导航卡片**：新闻、博客、项目、关于四个入口卡片

### 阶段五：功能页面开发

10. **开发新闻页面**：新闻列表、卡片组件、分类筛选、分页
11. **开发博客列表页面**：文章卡片、标签筛选、搜索功能
12. **开发博客详情页面**：Markdown 渲染、目录导航、上下篇导航
13. **开发项目作品集页面**：项目卡片网格、技术栈标签、链接按钮
14. **开发个人简介页面**：头像、行业信息、技能可视化、教育背景
15. **开发联系页面**：表单验证、社交链接、提交功能

### 阶段六：样式和优化

16. **整体样式优化**：主题色、卡片样式、间距、字体
17. **响应式布局调整**：移动端适配、平板适配、汉堡菜单
18. **添加动画效果**：页面过渡、卡片 hover、加载骨架屏、平滑滚动

### 阶段七：测试和上线

19. **功能测试和优化**：浏览器测试、性能优化、代码优化

## 七、TODO 列表

- [ ] 1. 安装项目依赖：Element Plus、@element-plus/icons-vue、axios、dayjs、markdown-it
- [ ] 2. 创建项目目录结构（components、views、layouts、services、types、data、styles 等）
- [ ] 3. 定义 TypeScript 类型接口（News、Article、Project、Profile 等）
- [ ] 4. 创建静态数据文件（articles.json、projects.json、profile.json）并填充示例数据
- [ ] 5. 创建服务层：axios 实例配置、新闻 API、数据加载服务
- [ ] 6. 开发 MainLayout、Header（导航栏）、Footer 组件
- [ ] 7. 配置完整路由（7个页面路由 + 过渡动画）
- [ ] 8. 开发首页 Hero 区（大标题、副标题、背景效果、CTA 按钮）
- [ ] 9. 开发首页功能导航卡片（新闻、博客、项目、关于四个入口卡片）
- [ ] 10. 开发新闻页面（新闻列表、卡片组件、分类筛选、分页）
- [ ] 11. 开发博客列表页面（文章卡片、标签筛选、搜索功能）
- [ ] 12. 开发博客详情页面（Markdown 渲染、目录导航、上下篇导航）
- [ ] 13. 开发项目作品集页面（项目卡片网格、技术栈标签、链接按钮）
- [ ] 14. 开发个人简介页面（头像、行业信息、技能可视化、教育背景）
- [ ] 15. 开发联系页面（表单验证、社交链接、提交功能）
- [ ] 16. 整体样式优化（主题色、卡片样式、间距、字体）
- [ ] 17. 响应式布局调整（移动端适配、平板适配、汉堡菜单）
- [ ] 18. 添加动画效果（页面过渡、卡片 hover、加载骨架屏、平滑滚动）
- [ ] 19. 功能测试和优化（浏览器测试、性能优化、代码优化）

## 八、注意事项

1. **首页设计**：首页不直接展示新闻和博客内容，而是通过精美的导航卡片引导用户点击进入相应页面
2. **个人简介**：只展示所在行业信息，不展示具体的工作经历和公司名称
3. **响应式优先**：确保所有页面在移动端都有良好的体验
4. **性能优化**：图片懒加载、代码分割、合理使用缓存
5. **可扩展性**：数据结构设计要考虑后续接入真实后端 API 的可能性

---
