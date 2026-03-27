---
author: Greg Miller
datetime: 2026-03-27T14:00:00Z
title: Why CSS logical properties are the efficient default
slug: css-logical-properties-efficiency
featured: true
draft: false
tags:
  - css
  - layout
  - web-standards
ogImage: ""
description:
  How margin-inline, padding-block, and friends replace left/right gymnastics with fewer
  declarations and better RTL and writing-mode behavior—without extra media queries.
---

For years we reached for `padding-left` and `padding-right` because the screen felt like “horizontal.” That works until you support **right-to-left** layouts, vertical writing modes, or you simply want one declaration instead of two. **Logical properties** describe space along the **inline** and **block** axes—where text flows and where blocks stack—not “west” and “east” of the viewport.

## Table of contents

## One declaration instead of two

If you want equal horizontal padding, this is familiar:

```css
.card {
  padding-left: 1rem;
  padding-right: 1rem;
}
```

With logical properties you express the same intent in one line:

```css
.card {
  padding-inline: 1rem;
}
```

You write less CSS, and the meaning is clearer: “padding on the inline axis,” not “padding on two arbitrary sides.” That is a small win in every component file—and it adds up across a design system.

## The mental model: inline vs block

- **Inline** is the direction text runs in a line (usually left-to-right in English; right-to-left in Arabic or Hebrew).
- **Block** is the direction blocks stack (usually top-to-bottom).

So `margin-inline` covers start and end along the line; `margin-block` covers the perpendicular direction. When you use **physical** properties, you are naming compass directions. When you use **logical** ones, you are naming **flow**, which is what layout is actually about.

Common pairs:

| Physical (two values)                | Logical (one value)                |
| ------------------------------------ | ---------------------------------- |
| `padding-left` / `padding-right`     | `padding-inline`                   |
| `padding-top` / `padding-bottom`     | `padding-block`                    |
| `margin-left` / `margin-right`       | `margin-inline`                    |
| `width` / `height` (in flow context) | often `inline-size` / `block-size` |

Shorthands like `inset-inline` for `left`+`right` (or their logical equivalents) follow the same idea.

## RTL without duplicate rules

The big payoff is **internationalization**. If you mirror a layout for RTL, physical properties force you to duplicate or override rules: one block for LTR, another for RTL. Logical properties flip with the writing direction, so the same rule can serve both—no `[dir="rtl"]` patch for every component that used `margin-left`.

That is not just “accessibility”—it is **less code to maintain** and fewer bugs when someone adds a new panel and forgets the RTL override.

## Efficiency in the real sense

“Efficiency” here is not only bytes on the wire (though fewer properties help). It is:

- **Fewer declarations** for symmetric spacing and sizing.
- **One source of truth** for layout that should follow writing mode.
- **Clearer intent** for the next person reading the stylesheet.

Logical properties are well supported in modern browsers. For legacy constraints, you can still layer physical fallbacks or use tools that emit both; for greenfield components, defaulting to logical naming keeps the cascade simpler from day one.

If you are still typing `left` and `right` for symmetric gutters, try `inline` once—your RTL future self (and your line count) will notice.
