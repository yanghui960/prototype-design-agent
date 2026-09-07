'use strict';
// 千容AI工作台 · AI 适配层（OpenAI 兼容协议）
// 支持任意 OpenAI 兼容端点：豆包 / 通义 / DeepSeek / Ollama / 自建服务
// 未配置 key 时返回结构化模板结果（template: true），保证功能不中断
const { db } = require('./db');

const DEFAULT_TIMEOUT_MS = 30000;

function getConfig() {
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'ai'").get();
    if (row && row.value) return JSON.parse(row.value);
  } catch (e) { /* ignore */ }
  return { baseUrl: '', apiKey: '', model: '' };
}

function saveConfig(cfg) {
  const clean = {
    baseUrl: String(cfg.baseUrl || '').trim(),
    apiKey: String(cfg.apiKey || '').trim(),
    model: String(cfg.model || '').trim(),
  };
  db.prepare("INSERT OR REPLACE INTO settings(key, value) VALUES('ai', ?)").run(JSON.stringify(clean));
  return clean;
}

function configured() {
  const c = getConfig();
  return !!(c.baseUrl && c.model);
}

// 规范化 baseUrl：确保以 /v1 结尾（用户可能填 https://api.openai.com 或 https://api.openai.com/v1/）
function normalizeBaseUrl(baseUrl) {
  let b = baseUrl.replace(/\/+$/, '');
  if (!/\/v1$/.test(b)) b = b + '/v1';
  return b;
}

// 调 OpenAI 兼容 chat/completions
async function chat(messages, opts = {}) {
  const cfg = getConfig();
  if (!configured()) {
    return { template: true, content: null, reason: 'not_configured' };
  }
  const url = normalizeBaseUrl(cfg.baseUrl) + '/chat/completions';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs || DEFAULT_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cfg.apiKey,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens ?? 1200,
      }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      return { template: false, error: `AI 服务返回 ${resp.status}: ${body.slice(0, 200)}` };
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return { template: false, error: 'AI 服务返回内容为空' };
    return { template: false, content, error: null };
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'AI 请求超时' : `AI 请求失败: ${e.message}`;
    return { template: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

// 从 AI 返回文本中提取 JSON 对象（容忍 ```json 代码块与前后噪音）
function extractJson(text) {
  try {
    const t = text.trim();
    if (t.startsWith('{')) return JSON.parse(t);
    const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) return JSON.parse(m[1].trim());
    const s = t.indexOf('{');
    const e = t.lastIndexOf('}');
    if (s >= 0 && e > s) return JSON.parse(t.slice(s, e + 1));
  } catch (e) { /* fallthrough */ }
  return null;
}

module.exports = { chat, getConfig, saveConfig, configured, extractJson, normalizeBaseUrl };
