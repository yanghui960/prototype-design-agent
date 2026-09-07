# Visual Language

## Positioning

Design a local, single-user operations workbench. The screen should feel like something a founder/operator opens every morning to make decisions, inspect tasks, trigger workflows, and review evidence.

Use these adjectives as constraints: calm, dense, precise, restrained, reliable, Chinese-first, implementation-ready.

Do not design: marketing hero, SaaS landing page, glassmorphism, decorative gradient page, oversized editorial title, empty showcase, or playful consumer app.

## Palette

Use this base unless the user gives a newer approved palette:

| Role | Color |
| --- | --- |
| Page background | `#F5F6F7` |
| Surface | `#FFFFFF` |
| Sidebar | `#F0F1F2` |
| Primary text | `#202124` |
| Secondary text | `#686D76` |
| Border | `#E2E4E8` |
| Primary coral | `#E76852` |
| Success | `#2F8F63` |
| Warning | `#B7791F` |
| Danger | `#C84B45` |
| Info | `#3677A8` |

Accent budget: coral appears on the primary action, active navigation/tab, selected row or highlight, and one key metric at most. Semantic colors should be small dots, text, or subtle backgrounds, not large saturated blocks.

## Typography

Use system Chinese UI fonts:

```css
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
```

Use mono only for numbers, timestamps, ids, hashes, model ids, versions, and rankings:

```css
font-family: SFMono-Regular, Consolas, monospace;
font-variant-numeric: tabular-nums;
```

Recommended scale:

| Use | Size |
| --- | --- |
| Page title | 18-22px |
| Section title | 14-16px |
| Body | 13-15px |
| Dense table | 12-14px |
| Metadata | 12-13px |
| Major metric | 22-32px |

Letter spacing should be `0`. Avoid all-caps English styling in Chinese UI.

## Shape And Spacing

- Base spacing: `4 / 8 / 12 / 16 / 24 / 32`.
- Card radius: max `8px`.
- Input/button radius: around `6px`.
- Borders: 1px fine gray over heavy shadows.
- Shadows: minimal; rely on hierarchy, dividers, and surface contrast.
- Sidebars should be subtly tinted, not full dark.
- Keep toolbars compact, aligned, and scannable.

## Component Tone

Use:

- Left navigation grouped by work domain.
- Topbar with title, update time, search, task state, and system exception entry.
- Segmented controls for modes.
- Tabs for subpages.
- Filters as compact controls.
- Drawers for details and editing.
- Dialogs for metric drill-down or confirmation.
- Tables for comparable structured records.
- Cards for repeated records such as opportunities, reports, employees, or materials.

Avoid:

- Cards inside cards.
- Decorative orbs/blobs.
- Fake product screenshots made from meaningless rectangles.
- Colored pills on every metric delta.
- Large empty hero sections.
- Tooltip-only operation paths.
- Hover-only functionality.

## Copy

Use plain Chinese workbench language:

- Good: `刷新热点`、`保存草稿`、`确认入库`、`系统异常`、`关联选题与素材`
- Bad: `开启你的创作之旅`、`释放无限潜能`、`一键赋能增长`

Every claim must map to a real capability, simulated state, or clearly marked future scope.
