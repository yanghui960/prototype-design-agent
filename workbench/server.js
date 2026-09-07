'use strict';
// 千容AI工作台 · 服务端入口（零依赖，node server.js 直接运行）
// 端口 8787 · 静态服务 mockups 目录 · JSON API · AI 适配
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { db } = require('./lib/db');
const ai = require('./lib/ai');

const PORT = process.env.PORT || 8787;
const MOCKUP_DIR = path.join(__dirname, '..', 'mockups');

// ---------- 工具 ----------
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}
function nowTime() { return new Date().toISOString().slice(11, 19); }
function nowDate() { return new Date().toISOString().slice(0, 10).replace(/-/g, '-'); }
function writeLog(level, module, message, cost = '') {
  db.prepare('INSERT INTO logs(ts, level, module, message, cost) VALUES(?,?,?,?,?)')
    .run(nowTime(), level, module, message, cost);
}
function parseId(seg) { const n = parseInt(seg, 10); return Number.isFinite(n) ? n : null; }

// ---------- 模板降级（未配置 AI 时使用）----------
const TEMPLATES = {
  revise(title) {
    return {
      titleOptions: [
        `${title}（实测版）`,
        `别再手动搬砖了：${title}`,
        `${title}，我试了一周的真实感受`,
      ],
      hook: `你是不是也每天被重复操作耗掉两三个小时？今天这篇实测，帮你算一笔时间账。`,
      ending: `如果你也在用 AI 提效，欢迎在评论区分享你的用法，点赞过 100 下周出进阶篇。`,
    };
  },
  insight(keyword) {
    return {
      overview: `「${keyword}」近期热度上升，相关讨论集中在效率提升与实操经验，存在内容供需缺口。`,
      points: [
        `用户高频关注点：上手成本、真实效果、工具对比`,
        `爆款内容多为「实测 + 清单」结构，收藏率高于均值`,
        `评论区常见需求：教程细节、避坑经验、案例数据`,
      ],
      suggestion: `建议产出 1 篇实测长文 + 1 条清单短视频，覆盖「怎么用」和「值不值得用」两个方向。`,
    };
  },
  retro() {
    return {
      highlights: [
        `「实测」类内容互动率 7.9%，为全站均值的 1.5 倍，建议下周加量`,
        `小红书渠道贡献 62% 阅读，发布时间段 11:00-13:00 表现最佳`,
        `AI 写作话题连续 2 周进入雷达热榜，内容供需缺口仍在`,
      ],
      concerns: [
        `视频号平均互动率 2.1%，低于 4% 基线，封面与标题匹配度待优化`,
        `「纯测评类」内容完读率偏低（38%），开头 3 秒钩子不足`,
      ],
      actions: [
        `下周生产计划：8 篇实测类 + 4 篇避坑类，覆盖 AI 写作 / 选品 / 本地探店`,
        `将「11:00-13:00 发布」写入生产工作室默认发布时段`,
        `视频号封面改用大字报模板，下周三复盘验证`,
      ],
    };
  },
};

// ---------- 静态服务 ----------
function serveStatic(req, res, urlPath) {
  let p = urlPath === '/' ? '/index.html' : urlPath;
  const file = path.normalize(path.join(MOCKUP_DIR, p));
  if (!file.startsWith(MOCKUP_DIR)) { json(res, 403, { error: 'forbidden' }); return; }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { json(res, 404, { error: 'not found' }); return; }
  const ext = path.extname(file).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8',
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}

// ---------- 路由 ----------
async function route(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  const pathname = url.pathname;
  const method = req.method;

  // 静态资源（非 /api 一律按文件服务）
  if (!pathname.startsWith('/api/')) {
    if (method !== 'GET') { json(res, 405, { error: 'method not allowed' }); return; }
    serveStatic(req, res, decodeURIComponent(pathname));
    return;
  }

  const seg = pathname.split('/').filter(Boolean); // e.g. ['api','todos','3']
  const base = seg[1];

  // 健康检查
  if (base === 'health') { json(res, 200, { ok: true, name: '千容AI工作台', time: nowTime() }); return; }
  if (base === 'brand') {
    const row = db.prepare("SELECT value FROM settings WHERE key='brand'").get();
    json(res, 200, { brand: row ? row.value : '千容AI工作台' });
    return;
  }

  // ---- 待办 ----
  if (base === 'todos') {
    if (method === 'GET') {
      const items = db.prepare('SELECT * FROM todos ORDER BY done ASC, id ASC').all();
      json(res, 200, { items });
      return;
    }
    if (method === 'POST') {
      const body = await readBody(req);
      if (!body.title) { json(res, 400, { error: 'title required' }); return; }
      const r = db.prepare('INSERT INTO todos(title, tag, time, done) VALUES(?,?,?,0)').run(body.title, body.tag || '', body.time || '');
      writeLog('info', 'todo.add', `新增待办「${body.title}」`);
      json(res, 201, { id: r.lastInsertRowid });
      return;
    }
    if (method === 'PATCH' && seg[2]) {
      const id = parseId(seg[2]);
      if (!id) { json(res, 400, { error: 'bad id' }); return; }
      const body = await readBody(req);
      if (typeof body.done === 'boolean') {
        db.prepare('UPDATE todos SET done = ? WHERE id = ?').run(body.done ? 1 : 0, id);
        writeLog('info', 'todo.toggle', body.done ? '待办已完成' : '待办重新打开');
      }
      json(res, 200, { ok: true });
      return;
    }
  }

  // ---- 雷达信号 ----
  if (base === 'radar' && seg[2] === 'signals') {
    if (method === 'GET') {
      const items = db.prepare('SELECT * FROM radar_signals ORDER BY id ASC').all();
      json(res, 200, { items });
      return;
    }
    if (method === 'PATCH' && seg[3]) {
      const id = parseId(seg[3]);
      if (!id) { json(res, 400, { error: 'bad id' }); return; }
      const body = await readBody(req);
      if (body.status) {
        db.prepare('UPDATE radar_signals SET status = ? WHERE id = ?').run(body.status, id);
        writeLog('info', 'radar.follow', `雷达机会 #${id} 已转为跟进`);
      }
      json(res, 200, { ok: true });
      return;
    }
  }

  // ---- 采集任务 ----
  if (base === 'collections') {
    if (method === 'GET') {
      const items = db.prepare('SELECT * FROM collections ORDER BY id DESC').all();
      items.forEach(i => { try { i.items = JSON.parse(i.items || '[]'); } catch (e) { i.items = []; } });
      json(res, 200, { items });
      return;
    }
    if (method === 'POST') {
      const body = await readBody(req);
      if (!body.name) { json(res, 400, { error: 'name required' }); return; }
      const r = db.prepare('INSERT INTO collections(name, platform, keyword, status, items, created_at) VALUES(?,?,?,?,?,?)')
        .run(body.name, body.platform || '', body.keyword || '', body.status || 'pending', '[]', nowDate() + ' ' + nowTime());
      writeLog('info', 'topic.collect', `发起采集「${body.name}」`);
      json(res, 201, { id: r.lastInsertRowid });
      return;
    }
    if (method === 'POST' && seg[2] === 'clean') {
      // 清洗所选条目：重跑状态并记日志（真实场景在此接入爬虫清洗管线）
      const body = await readBody(req);
      const ids = Array.isArray(body.ids) ? body.ids : [];
      let cleaned = 0;
      const stmt = db.prepare('UPDATE collections SET status = ?, items = ? WHERE id = ?');
      ids.forEach(id => {
        const row = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
        if (!row) return;
        let items = [];
        try { items = JSON.parse(row.items || '[]'); } catch (e) { items = []; }
        const cleanedItems = items.map((it, i) => (typeof it === 'string' ? it : it.title)).filter(Boolean);
        stmt.run('done', JSON.stringify(cleanedItems.length ? cleanedItems : ['示例素材条目 ' + (i => i + 1)(0)]), id);
        cleaned++;
      });
      writeLog('ok', 'topic.clean', `清洗完成 ${cleaned} 个采集任务`);
      json(res, 200, { ok: true, cleaned });
      return;
    }
  }

  // ---- 选题 ----
  if (base === 'topics') {
    if (method === 'GET') {
      const items = db.prepare('SELECT * FROM topics ORDER BY score DESC').all();
      json(res, 200, { items });
      return;
    }
    if (method === 'POST' && !seg[2]) {
      const body = await readBody(req);
      if (!body.title) { json(res, 400, { error: 'title required' }); return; }
      const r = db.prepare("INSERT INTO topics(title, platform, heat, score, status) VALUES(?,?,?,?, 'confirmed')")
        .run(body.title, body.platform || '', body.heat || '中', parseInt(body.score || '70', 10));
      writeLog('info', 'topic.confirm', `选题「${body.title}」已入选题池`);
      json(res, 201, { id: r.lastInsertRowid });
      return;
    }
    if (method === 'POST' && seg[2] === 'confirm') {
      const body = await readBody(req);
      const id = parseId(body.id);
      if (!id) { json(res, 400, { error: 'id required' }); return; }
      db.prepare("UPDATE topics SET status = 'confirmed' WHERE id = ?").run(id);
      writeLog('info', 'topic.confirm', `选题 #${id} 已确认`);
      json(res, 200, { ok: true });
      return;
    }
  }

  // ---- 稿件 ----
  if (base === 'drafts') {
    if (method === 'GET') {
      const items = db.prepare('SELECT * FROM drafts ORDER BY id DESC').all();
      items.forEach(i => { try { i.platforms = JSON.parse(i.platforms || '[]'); } catch (e) { i.platforms = []; } });
      json(res, 200, { items });
      return;
    }
    if (method === 'POST') {
      const body = await readBody(req);
      const r = db.prepare('INSERT INTO drafts(title, platforms, content, status, updated_at) VALUES(?,?,?,?,?)')
        .run(body.title || '未命名草稿', JSON.stringify(body.platforms || []), body.content || '', 'draft', nowDate() + ' ' + nowTime());
      writeLog('info', 'studio.save', `草稿「${body.title || '未命名'}」已保存`);
      json(res, 201, { id: r.lastInsertRowid });
      return;
    }
    if (method === 'PUT' && seg[2]) {
      const id = parseId(seg[2]);
      if (!id) { json(res, 400, { error: 'bad id' }); return; }
      const body = await readBody(req);
      db.prepare('UPDATE drafts SET title = ?, platforms = ?, content = ?, updated_at = ? WHERE id = ?')
        .run(body.title || '', JSON.stringify(body.platforms || []), body.content || '', nowDate() + ' ' + nowTime(), id);
      writeLog('info', 'studio.save', `草稿 #${id} 已更新`);
      json(res, 200, { ok: true });
      return;
    }
    if (method === 'POST' && seg[2] && seg[3] === 'publish') {
      const id = parseId(seg[2]);
      if (!id) { json(res, 400, { error: 'bad id' }); return; }
      db.prepare("UPDATE drafts SET status = 'published', updated_at = ? WHERE id = ?").run(nowDate() + ' ' + nowTime(), id);
      writeLog('ok', 'studio.publish', `草稿 #${id} 已确认入库`);
      json(res, 200, { ok: true });
      return;
    }
  }

  // ---- 复盘报告 ----
  if (base === 'reports') {
    if (method === 'GET') {
      const items = db.prepare('SELECT * FROM reports ORDER BY id DESC').all();
      items.forEach(i => { try { i.summary = JSON.parse(i.summary || '[]'); } catch (e) { i.summary = []; } });
      json(res, 200, { items });
      return;
    }
    if (method === 'POST' && seg[2] === 'generate') {
      const body = await readBody(req);
      const period = body.period || '09-01 至 09-07 (本周)';
      const title = body.title || '本周复盘报告';
      // 尝试真实 AI 生成；失败/未配置则使用模板
      let sections;
      const r = await ai.chat([
        { role: 'system', content: '你是数据复盘分析师。只输出 JSON，不要任何解释。' },
        { role: 'user', content: `基于本周表现数据（示例：实测类互动率7.9%、小红书贡献62%阅读、视频号互动率2.1%偏低），生成复盘报告 JSON：{"highlights":[2-3条],"concerns":[1-2条],"actions":[2-3条]}。每条 20 字内，可直接执行。` },
      ], { temperature: 0.4, maxTokens: 800 });
      const parsed = !r.template && !r.error ? ai.extractJson(r.content) : null;
      if (parsed && Array.isArray(parsed.highlights)) sections = parsed;
      else sections = TEMPLATES.retro();
      const r2 = db.prepare('INSERT INTO reports(title, period, summary, created_at) VALUES(?,?,?,?)')
        .run(title, period, JSON.stringify([
          { label: '最优平台', value: '小红书' }, { label: '最优内容类型', value: '实测类' },
          { label: '最优话题', value: 'AI 写作' }, { label: '最高互动率', value: '7.9%' },
        ]), nowDate() + ' ' + nowTime());
      writeLog('ok', 'retro.report', `复盘报告「${title}」生成完成（${r.template ? '模板' : 'AI'}）`, '4.1s');
      json(res, 201, { id: r2.lastInsertRowid, sections, aiMode: r.template ? 'template' : 'ai', aiError: r.error || null });
      return;
    }
  }

  // ---- AI 员工 ----
  if (base === 'employees') {
    if (method === 'GET') {
      const items = db.prepare('SELECT * FROM employees ORDER BY grp ASC, id ASC').all();
      json(res, 200, { items });
      return;
    }
  }

  // ---- 日志 ----
  if (base === 'logs') {
    if (method === 'GET') {
      const level = url.searchParams.get('level');
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      let items;
      if (level && level !== 'all') {
        items = db.prepare('SELECT * FROM logs WHERE level = ? ORDER BY id DESC LIMIT ?').all(level, limit);
      } else {
        items = db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT ?').all(limit);
      }
      json(res, 200, { items });
      return;
    }
  }

  // ---- 设置 / AI 配置 ----
  if (base === 'settings' && seg[2] === 'ai') {
    if (method === 'GET') {
      const c = ai.getConfig();
      json(res, 200, { ...c, apiKeyMasked: c.apiKey ? '已配置（sk-••••••）' : '未配置' });
      return;
    }
    if (method === 'PUT') {
      const body = await readBody(req);
      const saved = ai.saveConfig(body);
      writeLog('info', 'settings.ai', body.apiKey ? 'AI 配置已更新（含密钥）' : 'AI 配置已更新');
      json(res, 200, { ok: true, saved: { baseUrl: saved.baseUrl, model: saved.model, apiKeySet: !!saved.apiKey } });
      return;
    }
  }

  // ---- 知识库（真实扫描本机技能目录）----
  if (base === 'knowledge') {
    if (method === 'GET') {
      const roots = [
        process.env.USERPROFILE + '\\AppData\\Local\\Doubao\\User Data\\Default\\.doubao\\agent_mode\\workspace\\.user_skills',
        process.env.USERPROFILE + '\\AppData\\Local\\Doubao\\User Data\\Default\\.doubao\\agent_mode\\workspace\\.skills',
      ];
      const skills = [];
      const seen = new Set();
      for (const root of roots) {
        if (!fs.existsSync(root)) continue;
        for (const name of fs.readdirSync(root)) {
          if (seen.has(name)) continue;
          const dir = path.join(root, name);
          if (!fs.statSync(dir).isDirectory()) continue;
          const skillMd = path.join(dir, 'SKILL.md');
          let desc = '';
          if (fs.existsSync(skillMd)) {
            const head = fs.readFileSync(skillMd, 'utf-8').slice(0, 600);
            const m = head.match(/description:\s*(.+)/);
            if (m) desc = m[1].trim().slice(0, 60);
          }
          seen.add(name);
          skills.push({ name, desc, status: '可用', type: 'Skill' });
        }
      }
      json(res, 200, { items: skills, total: skills.length });
      return;
    }
  }

  // ---- AI 动作 ----
  if (base === 'ai') {
    const action = seg[2];

    if (action === 'revise') {
      const body = await readBody(req);
      const title = body.title || '';
      const content = body.content || '';
      const r = await ai.chat([
        { role: 'system', content: '你是资深新媒体编辑。只输出 JSON，不要任何解释。' },
        { role: 'user', content: `针对标题「${title || '未命名'}」和正文「${(content || '').slice(0, 500)}」，输出 JSON：{"titleOptions":[3个备选标题],"hook":"开头钩子改写(40字内)","ending":"结尾引导改写(40字内)"}。` },
      ], { temperature: 0.7, maxTokens: 900 });
      let result = r.template || r.error ? TEMPLATES.revise(title) : (ai.extractJson(r.content) || TEMPLATES.revise(title));
      writeLog(r.error ? 'warn' : 'ok', 'studio.revise', r.error ? `AI 修订失败，使用模板：${r.error}` : 'AI 修订完成：标题优化 3 条、钩子 1 条', '6.5s');
      json(res, 200, { result, aiMode: r.template ? 'template' : (r.error ? 'template' : 'ai'), aiError: r.error || null });
      return;
    }

    if (action === 'insight') {
      const body = await readBody(req);
      const keyword = body.keyword || '';
      const r = await ai.chat([
        { role: 'system', content: '你是内容运营分析师。只输出 JSON，不要任何解释。' },
        { role: 'user', content: `针对内容关键词「${keyword}」，输出洞察报告 JSON：{"overview":"一句话总览","points":[3条洞察],"suggestion":"1条可执行建议"}。每条 25 字内。` },
      ], { temperature: 0.6, maxTokens: 800 });
      let result = r.template || r.error ? TEMPLATES.insight(keyword) : (ai.extractJson(r.content) || TEMPLATES.insight(keyword));
      writeLog(r.error ? 'warn' : 'ok', 'topic.insight', r.error ? `洞察生成失败，使用模板：${r.error}` : `洞察报告生成：${keyword || '未命名关键词'}`, '3.2s');
      json(res, 200, { result, aiMode: r.template ? 'template' : (r.error ? 'template' : 'ai'), aiError: r.error || null });
      return;
    }

    if (action === 'retro') {
      const r = await ai.chat([
        { role: 'system', content: '你是数据复盘分析师。只输出 JSON，不要任何解释。' },
        { role: 'user', content: `输出复盘报告 JSON：{"highlights":[2-3条],"concerns":[1-2条],"actions":[2-3条]}。每条 20 字内，可直接执行。` },
      ], { temperature: 0.4, maxTokens: 800 });
      let result = r.template || r.error ? TEMPLATES.retro() : (ai.extractJson(r.content) || TEMPLATES.retro());
      json(res, 200, { result, aiMode: r.template ? 'template' : (r.error ? 'template' : 'ai'), aiError: r.error || null });
      return;
    }
  }

  json(res, 404, { error: 'not found' });
}

const server = http.createServer((req, res) => {
  route(req, res).catch(e => {
    console.error('[server error]', e);
    json(res, 500, { error: 'internal error' });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('============================================');
  console.log('  千容AI工作台 · 本地服务已启动');
  console.log(`  浏览器打开:  http://127.0.0.1:${PORT}`);
  console.log('  静态页面:   mockups/ 目录');
  console.log('  数据库:     workbench/data/workbench.db');
  console.log('============================================');
});
