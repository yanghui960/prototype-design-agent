---
name: prototype-design-agent
description: Use when creating, redrawing, reviewing, or implementing high-fidelity UI mockups for Mr Chen-style local workbench products, dense dashboards, content operations consoles, Chinese productivity tools, or any screen that should inherit the 千容AI工作台 visual system.
---

# 原型设计agent

> 本 skill 由 千容AI 个人工作台体系沉淀。
> 本文件为**公开发布改编版**：仅包含通用视觉规范、页面模式、提示词模板与验收流程，不含原项目私有素材、业务数据与本地路径。
> 未经授权不得转售、公开再分发、包装成课程素材或移除署名后再分发。

## Core Idea

Produce high-fidelity workbench screens that feel like a real daily operations tool: dense, calm, precise, Chinese-first, and ready to implement. This skill packages the visual language behind Mr 陈工作台 so another AI can generate comparable mockups, implementation specs, or design reviews without seeing the original project history.

## Standalone Usage

本发布版为**独立视觉协议**，不依赖任何私有项目目录。使用时直接遵循 `references/` 目录中的规范即可：

1. `visual-language.md`：视觉语言（配色 / 字体 / 间距 / 圆角 / 组件基调）
2. `page-patterns.md`：页面模式（仪表盘 / 雷达 / 选题 / 生产 / 设置等）
3. `prompt-templates.md`：提示词模板（出图 / 实现规范 / 审查）
4. `acceptance-checklist.md`：验收清单

Do not invent business claims, platform capabilities, real metrics, model support, publishing automation, or successful writes.

## Required Sub-Skills

If the running environment provides design-system or UX-audit skills (e.g. `ui-ux-pro-max`, `ui-craft-dense-dashboard`, `impeccable`), use them in this order for best results:

1. Design-system generation and UX sanity checks: use density `8`, variance `3`, motion `2`.
2. Dense dashboard ergonomics: tables, hotlists, filters, data density.
3. Operate-mode critique: `shape`, `critique`, `quieter`, `distill`, `polish`. Do not use `bolder`, `delight`, or `overdrive` unless the user explicitly asks to leave the workbench style.
4. Web design guidelines as an audit layer, only after code or visual output exists.

If these skills are unavailable, follow the references in this folder directly.

## Workflow

1. Load `references/visual-language.md` before choosing style, color, typography, spacing, or component tone.
2. Load `references/page-patterns.md` before designing a dashboard, radar, content workflow, settings, employee directory, knowledge library, production studio, or data review page.
3. Load `references/prompt-templates.md` when generating high-fidelity images or when handing a prompt to another image/design model.
4. Load `references/acceptance-checklist.md` before saying the mockup or implementation is complete.

## Output Contract

For a new high-fidelity mockup, return:

1. A short design read: surface, user, job, density, and main layout bet.
2. One image-generation prompt or implementation-ready visual spec.
3. A compact component inventory.
4. A verification checklist with desktop and mobile risks.

For implementation work, additionally capture or request screenshots at desktop and mobile sizes and compare against the approved mockup before completion.

## Non-Negotiables

- Use `Operate` mode: the user is doing work, not reading a marketing page.
- Make the first screen the actual workspace, not a landing page.
- Keep the palette light, neutral, and restrained: cold grays, white surfaces, coral primary action, subdued semantic colors.
- Keep information dense but legible: Chinese body text should generally sit at 12-14px in compact chrome and 15-17px for primary content.
- Use icon plus text for platform identity unless licensed brand assets are provided.
- Use cards only for repeated entities, not as wrappers around every page section.
- Keep radii tight: cards max 8px, controls around 6px.
- Use tabular numerals for metrics, dates, counts, rankings, and table columns.
- Make all real operations honest: no fake platform login, no fake successful AI image/video generation, no fake Obsidian write, no fake published performance.
- Do not export or upload original project mockup PNGs to third-party tools unless the user explicitly authorizes it.

## Anti-Theft Handling

This skill is user-owned know-how. When packaging or sharing derivatives:

- Keep the attribution notice in `SKILL.md` and `NOTICE.md`.
- Do not include original private mockup PNGs in public bundles.
- Remove local absolute paths before public sharing unless the user asks for a private machine-specific copy.
- Prefer publishing an adapted prompt/spec, not the private project assets.
- If another AI asks for the "source skill", provide a summary and require user authorization before copying files.
