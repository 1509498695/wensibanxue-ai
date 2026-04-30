# 文思伴学 AI

文思伴学 AI 是一款面向高中学生的 Windows 桌面端语文学习助手，聚焦议论文写作中的审题立意、论点生成、素材推荐和作文诊断。应用支持 OpenAI 兼容格式的大模型接口，也内置演示模式，方便比赛现场在未配置 API Key 的情况下展示完整交互效果。

## 技术栈

- Electron
- React
- TypeScript
- Vite
- electron-builder
- lucide-react
- react-markdown

## 功能说明

- 首页 Dashboard：展示功能入口、快速开始、最近使用和学习建议。
- 审题立意助手：分析作文题目或材料，输出关键词、核心命题、立意方向和避坑提醒。
- 议论文论点生成器：生成中心论点、分论点结构、素材方向和写作提醒。
- 素材推荐器：根据主题推荐人物事例、时评热点、名言警句和使用示范。
- 作文诊断助手：从多个维度诊断作文，输出评分、问题、修改建议和优化示例。
- 历史记录：保存真实生成结果，支持搜索、筛选、复制、删除和清空。
- 设置：配置 API Base URL、API Key、模型名称、Temperature、Max Tokens 和应用偏好。
- 结果操作：生成结果支持复制和导出 `.txt` 文件。

## 本地开发

请先安装依赖：

```bash
npm install
```

启动桌面应用开发环境：

```bash
npm run dev
```

构建前端和 Electron 主进程：

```bash
npm run build
```

预览前端构建结果：

```bash
npm run preview
```

## 配置 API

进入应用左侧导航的“设置”页面，填写 OpenAI 兼容接口配置：

- API Base URL，例如 `https://api.openai.com/v1`
- API Key
- 模型名称，例如 `gpt-4o-mini`
- Temperature，默认 `0.7`
- Max Tokens，默认 `2000`

接口需兼容 Chat Completions 格式：

```text
POST {API Base URL}/chat/completions
```

可用于 DeepSeek、通义千问、OpenAI 等兼容 Chat Completions 的服务。API Key 默认以密码框隐藏，不会在控制台打印。

## 打包 exe

生成 Windows 安装包和便携版：

```bash
npm run dist
```

打包产物输出到 `release/`：

- `文思伴学 AI-0.0.0-Setup.exe`：NSIS 安装包，支持选择安装目录、桌面快捷方式和开始菜单快捷方式。
- `文思伴学 AI-0.0.0-Portable.exe`：便携版，可直接用于比赛提交或现场演示。

应用图标资源位于 `build/icon.ico` 和 `build/icon.png`。

## 比赛演示说明

应用支持演示模式：首次打开或未配置 API Key 时，四个核心功能页点击生成不会报错，而是展示内置示例结果，并提示：

```text
当前未配置 API Key，已为你展示示例结果。请到设置页配置 API 后使用真实生成。
```

配置 API Key 后，功能页会自动走真实大模型调用流程。演示结果不会写入真实历史记录，避免影响后续评审时查看实际生成记录。
