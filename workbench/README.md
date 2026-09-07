# 千容AI工作台 · 本地服务

把 9 个页面原型变成真正可运行、可写库、可接 AI 的本地工作台。

## 运行

```bash
node server.js        # 或 npm start
```

- 服务地址：`http://127.0.0.1:8787`
- 需要 Node.js **>= 22.5**（使用内置 `node:sqlite`，零 npm 依赖）
- 浏览器打开 `http://127.0.0.1:8787/` 即可使用

## 架构

```
workbench/
├── server.js        # 服务入口：静态服务 + JSON API + AI 动作
├── lib/
│   ├── db.js        # SQLite 建表 + 示例数据播种（node:sqlite）
│   └── ai.js        # OpenAI 兼容 AI 适配层（可配 baseUrl/key/model）
├── data/
│   └── workbench.db # 本地数据库（自动创建，不入 git）
└── package.json     # 启动脚本（零依赖）
```

页面（`../mockups/*.html`）通过共享层 `workbench.js` 接 API：

- 后端未启动时：页面保持高保真示例数据，顶部提示"未连接工作台服务"
- 后端启动后：页面自动切换为数据库真实数据，动作真实落库

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET/POST | `/api/todos` | 待办列表 / 新增 |
| PATCH | `/api/todos/:id` | 勾选完成 |
| GET/PATCH | `/api/radar/signals` | 雷达信号 / 跟进状态 |
| GET/POST | `/api/collections` | 采集任务 / 发起采集 |
| POST | `/api/collections/clean` | 清洗所选采集 |
| GET/POST | `/api/topics` | 选题池 / 转为选题 |
| GET/POST/PUT | `/api/drafts` | 草稿读写 |
| POST | `/api/drafts/:id/publish` | 确认入库 |
| GET/POST | `/api/reports` | 复盘报告 / 生成 |
| GET | `/api/employees` | AI 员工名册 |
| GET | `/api/logs` | 运行日志（级别筛选） |
| GET/PUT | `/api/settings/ai` | AI 服务配置 |
| GET | `/api/knowledge` | 真实扫描本机技能目录 |
| POST | `/api/ai/revise` | AI 修订（标题/钩子/结尾） |
| POST | `/api/ai/insight` | 选题洞察 |
| POST | `/api/ai/retro` | 复盘生成 |

## 接入真实 AI（可选）

设置页 → 「AI 服务连接」，填入任意 OpenAI 兼容端点：

- **豆包**：`https://ark.cn-beijing.volces.com/api/v3` + 对应模型
- **通义千问**：`https://dashscope.aliyuncs.com/compatible-mode/v1` + 模型如 `qwen-plus`
- **DeepSeek**：`https://api.deepseek.com/v1` + `deepseek-chat`
- **本地 Ollama**：`http://127.0.0.1:11434/v1` + 已拉取的模型名

保存后，生产工作室的「AI 修订」、内容选题的「生成洞察」、数据复盘的「生成报告」会从模板结果切换为真实 AI 输出。未配置时优雅降级为模板（界面有标注）。

## 数据与隐私

- 所有数据只存在本机 `workbench/data/workbench.db`，不入库、不上传
- API Key 仅存本地数据库，界面不明文回显
- 首次启动自动创建数据库并播种示例数据；删除 db 文件即重置
