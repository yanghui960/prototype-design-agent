# Acceptance Checklist

Use this before delivering a mockup, implementation, or design review.

## Visual Fit

- [ ] The first viewport is the actual workbench surface, not a marketing page.
- [ ] The page uses the approved neutral/coral workbench palette.
- [ ] The screen is dense enough for daily operations but Chinese text remains readable.
- [ ] Major regions have clear proportion and alignment.
- [ ] Cards are not nested and are not used as generic section wrappers.
- [ ] Buttons and inputs use tight radii and do not look like oversized pills.
- [ ] Icons are one consistent thin-stroke family.
- [ ] Numeric data uses tabular numerals.
- [ ] There are no decorative gradient orbs, glass panels, stock-photo fillers, or fake logos.

## Product Honesty

- [ ] Simulated data is marked or phrased honestly.
- [ ] Missing real data uses empty states, not fake numbers.
- [ ] Platform login, publishing, Obsidian writes, AI image generation, and video generation are not claimed unless they exist.
- [ ] Business copy is concise Chinese operational language, not marketing language.
- [ ] Every visible action has a believable backend or a clear disabled/future/simulated state.

## Interaction

- [ ] Tabs, segmented controls, filters, drawers, dialogs, and tables use familiar semantics.
- [ ] Only one drawer/dialog layer is active unless the product explicitly requires nesting.
- [ ] Drawers do not cause main layout width jumps.
- [ ] Table overflow is local to the table region.
- [ ] Long Chinese titles wrap/truncate without covering neighboring controls.
- [ ] Loading uses shape-matched skeletons or local status, not generic full-page spinners.
- [ ] Error and empty states provide a next action.

## Responsive And A11y

- [ ] Check desktop around `1440x900`.
- [ ] Check compact desktop around `1280x800`.
- [ ] Check tablet around `768x1024`.
- [ ] Check mobile around `390x844`.
- [ ] No page-level horizontal overflow.
- [ ] Enabled mobile controls are at least `44 x 44` CSS px.
- [ ] Icon-only buttons have accessible names.
- [ ] Focus rings are visible.
- [ ] Text/background contrast reaches WCAG AA for normal UI text.
- [ ] Status is not communicated by color alone.

## Delivery Evidence

For code implementation:

- [ ] Run focused component tests.
- [ ] Run typecheck/build if available.
- [ ] Capture screenshots for required viewports.
- [ ] Compare source mockup and implementation side by side when an approved mockup exists.
- [ ] Record unresolved visual or accessibility risks explicitly.

For image-only mockups:

- [ ] Provide the final prompt or spec used.
- [ ] List expected components and states.
- [ ] Call out any areas that need product confirmation before implementation.
