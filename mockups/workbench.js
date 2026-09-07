/* 千容AI工作台 · 前端共享层
 * 用法：每页引入本脚本，在 WB.ready(cb) 回调中接 API。
 * 后端未启动时页面保持示例数据，并显示提示条。 */
(function () {
  var WB = { online: false, health: null };

  WB.api = function (path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', headers: { 'Content-Type': 'application/json' } };
    if (opts.body) init.body = JSON.stringify(opts.body);
    return fetch(path, init)
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .catch(function () { return { error: 'network' }; });
  };

  WB.toast = function (msg, type) {
    var box = document.getElementById('wb-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'wb-toast';
      box.style.cssText = 'position:fixed;top:14px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(box);
    }
    var el = document.createElement('div');
    el.style.cssText = 'background:#202124;color:#fff;font-size:12.5px;padding:9px 14px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.18);max-width:320px;';
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, 2600);
    setTimeout(function () { el.remove(); }, 3100);
  };

  // 连接状态条：后端未启动时提示（不阻塞示例数据展示）
  WB.showBanner = function (msg) {
    var b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:0;left:232px;right:0;background:#B7791F;color:#fff;font-size:12px;padding:5px 16px;z-index:9998;';
    b.textContent = msg;
    document.body.appendChild(b);
  };

  // 渲染工具：清空容器并按 renderFn 重建子项
  WB.list = function (container, items, renderFn, emptyText) {
    if (!container) return;
    container.innerHTML = '';
    if (!items || !items.length) {
      if (emptyText) {
        var e = document.createElement('div');
        e.style.cssText = 'padding:14px;color:#9AA0A6;font-size:12px;';
        e.textContent = emptyText;
        container.appendChild(e);
      }
      return;
    }
    items.forEach(function (it) {
      var el = renderFn(it);
      if (el) container.appendChild(el);
    });
  };

  // 待所有页面 DOM 就绪后调用；online=true 表示后端在线
  WB.ready = function (cb) {
    function boot() {
      fetch('/api/health', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (h) { WB.online = true; WB.health = h; cb(true, h); })
        .catch(function () {
          WB.online = false;
          if (location.protocol === 'http:') {
            WB.showBanner('未连接工作台服务（示例数据展示中）· 在 workbench 目录运行 node server.js 启动');
          }
          cb(false, null);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  };

  window.WB = WB;
})();
