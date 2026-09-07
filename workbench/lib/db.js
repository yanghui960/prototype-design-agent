'use strict';
// 千容AI工作台 · 数据库层（node:sqlite 内置模块，零依赖）
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'workbench.db');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  tag TEXT DEFAULT '',
  time TEXT DEFAULT '',
  done INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS radar_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT DEFAULT 'mid',        -- high / mid / low
  keyword TEXT NOT NULL,
  platform TEXT DEFAULT '',
  strength INTEGER DEFAULT 2,      -- 1..3
  summary TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',   -- pending / followed
  created_at TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  platform TEXT DEFAULT '',
  keyword TEXT DEFAULT '',
  status TEXT DEFAULT 'done',      -- done / running / pending
  items TEXT DEFAULT '[]',         -- JSON 数组
  created_at TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  platform TEXT DEFAULT '',
  heat TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'candidate'  -- candidate / confirmed / published
);
CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT DEFAULT '',
  platforms TEXT DEFAULT '[]',
  content TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  updated_at TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  period TEXT DEFAULT '',
  summary TEXT DEFAULT '[]',       -- JSON 数组
  created_at TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  grp TEXT DEFAULT '',
  status TEXT DEFAULT 'online',
  engine TEXT DEFAULT '',
  duty TEXT DEFAULT '',
  task TEXT DEFAULT '',
  today INTEGER DEFAULT 0,
  week INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  success TEXT DEFAULT '',
  last_active TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  level TEXT DEFAULT 'info',
  module TEXT DEFAULT '',
  message TEXT DEFAULT '',
  cost TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);
`);

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM todos').get().n;
  if (count > 0) return; // 已有数据，不重复播种

  const now = () => new Date().toISOString().slice(11, 19);

  const todos = [
    ['确认「AI 写作实测」发布时间', '选题', '10:30', 0],
    ['回复雷达高优机会（AI 办公助手）', '雷达', '11:00', 0],
    ['视频号封面换用大字报模板', '生产', '14:00', 0],
    ['导入小红书上周数据到复盘', '复盘', '15:30', 1],
    ['周会前整理内容周报', '管理', '17:00', 1],
  ];
  const itodo = db.prepare('INSERT INTO todos(title, tag, time, done) VALUES(?,?,?,?)');
  todos.forEach(t => itodo.run(...t));

  const signals = [
    ['high', 'AI 办公助手', '小红书', 3, '「AI 办公」话题周增长 320%，低粉账号爆文率明显上升', 'pending', '09-07 09:30'],
    ['high', '本地探店', '抖音', 3, '本地探店视频互动率 8.1%，评论区"求地址"高频出现', 'pending', '09-07 09:15'],
    ['mid', 'AI 写作', '公众号', 2, 'AI 写作话题连续 2 周进入雷达热榜，供需缺口仍在', 'pending', '09-07 08:50'],
    ['mid', '极简办公桌搭', '小红书', 2, '桌面美学类笔记收藏率高，适合图文带货', 'pending', '09-07 08:20'],
    ['low', '效率工具清单', '公众号', 1, '清单类内容完读率稳定，可作为长尾选题', 'followed', '09-06 18:40'],
  ];
  const isig = db.prepare('INSERT INTO radar_signals(level, keyword, platform, strength, summary, status, created_at) VALUES(?,?,?,?,?,?,?)');
  signals.forEach(s => isig.run(...s));

  const cols = [
    ['AI 办公助手素材', '小红书', 'AI 办公', 'done', '["AI办公实测截图×6","评论区高赞观点×12","工具对比表格×1"]', '09-07 09:20'],
    ['本地探店线索', '抖音', '揭阳 探店', 'running', '[]', '09-07 09:10'],
    ['AI 写作长文', '公众号', 'AI 写作 实测', 'pending', '[]', '09-07 08:55'],
  ];
  const icol = db.prepare('INSERT INTO collections(name, platform, keyword, status, items, created_at) VALUES(?,?,?,?,?,?)');
  cols.forEach(c => icol.run(...c));

  const topics = [
    ['AI 办公助手实测：3 个工具替代 4 小时重复工作', '小红书', '高', 92, 'confirmed'],
    ['本地探店 | 揭阳这家店的 AI 点单体验', '抖音', '中', 78, 'candidate'],
    ['用 AI 写作 30 天，我踩过的 5 个坑', '公众号', '高', 85, 'candidate'],
    ['极简办公桌 3.0：桌搭清单与价格', '小红书', '中', 71, 'candidate'],
  ];
  const itopic = db.prepare('INSERT INTO topics(title, platform, heat, score, status) VALUES(?,?,?,?,?)');
  topics.forEach(t => itopic.run(...t));

  const drafts = [
    ['AI 办公助手实测：3 个工具替代 4 小时重复工作', '["小红书","公众号"]', '今天实测了 3 个 AI 办公工具…（示例正文）', 'draft', '09-07 09:35'],
  ];
  const idraft = db.prepare('INSERT INTO drafts(title, platforms, content, status, updated_at) VALUES(?,?,?,?,?)');
  drafts.forEach(d => idraft.run(...d));

  const reports = [
    ['本周复盘报告', '09-01 至 09-07 (本周)', JSON.stringify([
      { label: '最优平台', value: '小红书' }, { label: '最优内容类型', value: '实测类' },
      { label: '最优话题', value: 'AI 写作' }, { label: '最高互动率', value: '7.9%' },
    ]), '09-07 09:36'],
    ['上周复盘报告', '08-25 至 08-31 (上周)', JSON.stringify([
      { label: '最优平台', value: '公众号' }, { label: '最优内容类型', value: '清单类' },
      { label: '最优话题', value: '效率工具' }, { label: '最高互动率', value: '6.2%' },
    ]), '08-31 09:12'],
    ['7月月度复盘', '07-01 至 07-31 (月报)', JSON.stringify([
      { label: '最优平台', value: '小红书' }, { label: '最优内容类型', value: '教程类' },
      { label: '最优话题', value: 'AI 工具' }, { label: '最高互动率', value: '8.4%' },
    ]), '08-01 09:05'],
  ];
  const irep = db.prepare('INSERT INTO reports(title, period, summary, created_at) VALUES(?,?,?,?)');
  reports.forEach(r => irep.run(...r));

  const emps = [
    ['选题官', '内容 · 选题与热榜分析', '内容组', 'online', 'qianrong-vision-1', '负责雷达信号筛选、选题建议与热点趋势分析。', '正在分析「AI 写作」话题热度', 8, 42, 518, '96%', '刚刚'],
    ['内容写手', '内容 · 稿件生成与改写', '内容组', 'online', 'qianrong-write-2', '负责生产工作室的初稿生成、AI 修订与多平台改写。', '修订「AI 写作实测」草稿', 14, 76, 920, '93%', '2 分钟前'],
    ['校对员', '内容 · 事实与错别字校验', '内容组', 'idle', 'qianrong-check-1', '负责发布前的错别字、事实性与合规检查。', '等待任务', 6, 31, 402, '99%', '18 分钟前'],
    ['雷达分析师', '数据 · 信号扫描与趋势建模', '数据组', 'busy', 'qianrong-radar-1', '每 15 分钟扫描平台信号，输出优先级提醒与热榜。', '扫描小红书 09:45 批次', 12, 84, 1205, '98%', '刚刚'],
    ['复盘师', '数据 · 复盘报告生成', '数据组', 'online', 'qianrong-retro-1', '导入表现数据后生成周报、月报与行动建议。', '等待新数据导入', 2, 9, 87, '97%', '6 分钟前'],
    ['运维助手', '系统 · 健康检查与异常告警', '系统组', 'online', 'qianrong-ops-1', '监控数据库、任务队列与外部连接健康状态。', '例行巡检中（每 5 分钟）', 24, 168, 2010, '99%', '1 分钟前'],
    ['调度助手', '系统 · 任务编排与队列管理', '系统组', 'busy', 'qianrong-sched-1', '编排采集、生产、复盘的自动化任务队列。', '重排「本地探店」采集队列', 31, 204, 3104, '98%', '刚刚'],
  ];
  const iemp = db.prepare('INSERT INTO employees(name, role, grp, status, engine, duty, task, today, week, total, success, last_active) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)');
  emps.forEach(e => iemp.run(...e));

  const logs = [
    ['09:43:12', 'ok', 'radar.scan', '小红书 09:45 批次扫描完成，捕获信号 12 条', '0.8s'],
    ['09:42:47', 'error', 'db.conn', '数据库连接超时（1200ms > 阈值 800ms），已自动重连', '1.2s'],
    ['09:42:10', 'warn', 'schedule.queue', '「本地探店」采集队列重排完成，等待任务 3 个', '0.4s'],
    ['09:41:38', 'ok', 'studio.revise', 'AI 修订完成：标题优化 1 条、开头钩子 1 条已应用', '6.5s'],
    ['09:40:55', 'info', 'retro.import', '已导入 3 份数据文件（xhs / gzh / shipinhao）', '0.3s'],
    ['09:38:02', 'warn', 'obsidian.sync', 'Obsidian 索引延迟 2 分钟，文件数 6 未变化', '0.2s'],
    ['09:36:44', 'ok', 'retro.report', '本周复盘报告生成完成，共 3 个结论区块', '4.1s'],
    ['09:35:20', 'info', 'studio.save', '草稿「AI 写作实测」自动保存', '0.1s'],
    ['09:32:15', 'ok', 'topic.insight', '洞察报告生成：AI 写作助手（高相关 6 条）', '3.2s'],
    ['09:30:00', 'info', 'radar.tick', '雷达定时扫描启动（周期 15 分钟）', '0.1s'],
  ];
  const ilog = db.prepare('INSERT INTO logs(ts, level, module, message, cost) VALUES(?,?,?,?,?)');
  logs.forEach(l => ilog.run(...l));

  const iset = db.prepare('INSERT OR IGNORE INTO settings(key, value) VALUES(?,?)');
  iset.run('ai', JSON.stringify({ baseUrl: '', apiKey: '', model: '' }));
  iset.run('brand', '千容AI工作台');
}

seed();

module.exports = { db };
