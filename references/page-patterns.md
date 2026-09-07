# Page Patterns

## App Shell

Use a persistent left sidebar and topbar.

Sidebar groups:

- 日常
- 运营
- 工具
- 系统

Keep the active item coral-tinted with a narrow left indicator. Put page actions inside the page, not all in the global topbar.

Responsive rules:

- Desktop: sidebar around `232px`.
- Below `1024px`: icon rail around `64px`.
- Below `768px`: overlay navigation.
- Drawers become full-width on mobile.

## Daily Dashboard

Job: answer "What needs attention today?"

Order:

1. 今日待办
2. 雷达新增机会
3. 昨天内容数据
4. 高价值洞察
5. 系统异常

Use a main column plus a compact right rail. Do not use one huge KPI grid. Show real empty states if data is missing.

## Radar Monitoring

Job: inspect live opportunity signals.

Structure:

1. Top metric strip for 今日雷达.
2. Date strip.
3. Left: priority reminders, independently scrollable.
4. Right: platform hotlists, independently scrollable.
5. Metric click opens a centered dialog.
6. Reminder or hotspot click opens one shared right drawer.

Do not make the lightbulb or signal icon a fake button. Use it only as visual meaning.

## Content Topics

Job: move from collection to insight to topic.

Tabs:

- 采集
- 洞察
- 选题

Collection page starts with the input composer, not a blank page with only "new". Merge collection task and result into one card list. Result drawer supports selecting items and starting clean/insight actions.

Insight page shows only successful reports. Topic page uses one table and differentiates states with labels.

## Production Studio

Job: create and edit one platform-ready content version.

Use a creation dialog for first generation. After saving, use a two-column workspace:

- Left about 64%: structured editing and AI revision.
- Right about 36%: platform phone preview.

Do not add a permanent third column. Put image/video details in drawers, lightboxes, or local panels.

For phone preview, keep one stable logical viewport: `390 x 844`, graphite shell, same radius and status bar across platforms.

## Settings

Job: configure resources without hiding keys or faking capability.

Use tabs:

- 大模型配置
- 平台连接
- 系统信息

Show configured models as flat rows/cards. Capability labels are read-only hints. Do not pre-block generation based on inferred model capability; the backend result decides support.

## AI Employees

Job: inspect local agents as a read-only roster.

Use floor/department groups and equal cards. Every card shows avatar, role, status, engine, duty, current task, today count, seven-day count, total count, success rate, and last active time.

Do not expose raw private chat logs, tokens, app secrets, or fake dispatch buttons.

## Data Retro

Job: import actual performance evidence and produce a review.

Use:

1. Top metric strip.
2. Left setup panel.
3. Center current report.
4. Right history panel.

No uploaded data means no fake metrics or completed report.

## Knowledge, Skill, And Tool Libraries

Job: inspect local capabilities and files safely.

Use search, filters, grouped lists, and a detail drawer. Clearly separate:

- 可用
- 仅后台接入
- 前端可选择
- 尚未接入

For Obsidian files, default to read-only views unless the project explicitly authorizes controlled writes.
