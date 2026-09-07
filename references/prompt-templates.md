# Prompt Templates

## Image Mockup Prompt

Use this for image-generation or visual-design models.

```text
Create a high-fidelity desktop web app mockup for "千容AI工作台", a local single-user Chinese operations workbench.

Surface: [page name]
User job: [what the user needs to inspect or complete]

Visual style:
- Operate-mode product UI, dense but calm, not a landing page.
- Light cold-neutral interface: #F5F6F7 page background, #FFFFFF surfaces, #F0F1F2 sidebar, #202124 primary text, #686D76 secondary text, #E2E4E8 borders.
- Coral #E76852 as the only brand accent for primary action, active nav/tab, selected state, and one key highlight.
- System Chinese UI typography, compact hierarchy, tabular numerals for all data.
- Fine dividers, 6px controls, cards no more than 8px radius.
- Lucide-like thin stroke icons, icon plus Chinese text labels.
- No marketing hero, no decorative gradient, no glassmorphism, no nested cards, no fake platform logos.

Layout:
- Persistent left sidebar grouped by 日常 / 运营 / 工具 / 系统.
- Topbar with page title, update time, search, task state, system exception entry.
- Main workspace should show real controls immediately.
- Use tables, compact lists, segmented controls, tabs, filters, drawers, dialogs, and phone preview only when the page job needs them.

Content rules:
- Use concise Chinese UI copy.
- Show honest empty/simulated states; do not claim real publishing, platform login, Obsidian write, AI image/video generation, or performance data unless supplied.
- Long Chinese titles must wrap or truncate cleanly without overlapping controls.

Required details for this surface:
[surface-specific layout, columns, panels, key records, drawer/dialog state, selected item]

Output: one polished high-fidelity UI mockup, desktop 1440x900 or 1536x1024, crisp text, implementation-ready spacing and component structure.
```

## Implementation Spec Prompt

Use this when asking a coding AI to implement the mockup.

```text
Implement this screen in the 千容AI工作台 visual system.

Stack: React + TypeScript + CSS Modules.
Mode: Operate.
Density: 8/10.
Motion: 2/10.
Accent: #E76852.

Respect these rules:
- Use the existing app shell, tokens, Drawer, Dialog, PlatformIcon, StatusTag, and routing patterns.
- Keep page sections unframed unless they are repeated entity cards.
- Use semantic tables/lists for comparable data.
- Give icon-only buttons accessible labels and tooltips.
- Keep enabled controls at least 44x44 CSS px on mobile.
- Prevent page-level horizontal overflow; tables own their own horizontal scroll.
- Capture desktop and mobile screenshots before claiming completion.

Screen requirements:
[requirements]

Reference mockup:
[path if local and authorized]
```

## Review Prompt

Use this to ask another AI to audit a mockup or implementation.

```text
Review this 千容AI工作台 high-fidelity screen against the workbench visual system.

Check, in order:
1. Does it feel like a real operations workspace instead of a landing page?
2. Is the density high but still readable in Chinese?
3. Are color, typography, spacing, radius, icons, and states consistent?
4. Are cards used only for repeated entities or framed tools?
5. Do tables, drawers, dialogs, filters, and tabs follow expected product UI semantics?
6. Does it avoid fake capabilities or unsupported business claims?
7. Would it survive 1440x900, 1280x800, 768x1024, and 390x844?

Return findings first. Mention only actionable issues, ordered by severity.
```

## Surface Fill-Ins

Dashboard:

```text
Show 今日待办, 雷达新增机会, 昨天内容数据, 高价值洞察, 系统异常. Main column plus compact right rail. No giant KPI grid.
```

Radar:

```text
Top metric strip, date strip, left priority reminders, right platform hotlists, one right drawer open for a selected reminder, independent scrolling zones.
```

Topics:

```text
Tabs for 采集 / 洞察 / 选题. Composer at top. Merged collection cards. Result drawer open with selected cleaned rows and batch action footer.
```

Production:

```text
Two-column editor: left structured content editing and AI revision, right stable 390x844 phone preview. Show platform-specific preview without resizing the phone.
```

Settings:

```text
Flat model configuration list with search, connection status filter, enabled switches, detail drawer. Do not show API key plaintext.
```
