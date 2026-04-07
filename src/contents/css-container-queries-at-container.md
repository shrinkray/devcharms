---
author: Greg Miller
datetime: 2026-04-07T12:00:00Z
title: "@container: responsive layout that follows the component, not the viewport"
slug: css-container-queries-at-container
featured: true
draft: false
tags:
  - css
  - layout
  - responsive-design
ogImage: ""
description:
  Container queries and the @container rule let you style elements from their parent's
  width—so cards, sidebars, and embeds adapt inside columns and grids without viewport
  media queries.
---

Media queries answer a single question: **how wide is the viewport?** That is the right default for page-level concerns, but components rarely care about the window—they care about **the space they actually get**. A card might sit in a narrow sidebar or a full-width column; **container queries** let styles react to **that** box instead of guessing from `100vw`.

## Table of contents

## From viewport to containment

**Container queries** need an element marked as a **query container**. You declare what the browser should track (usually **inline size**) with `container-type`:

```css
.card-grid {
  container-type: inline-size;
}
```

- **`inline-size`** — the container’s width in horizontal writing modes (what you want for most “responsive component” patterns).
- **`size`** — both inline and block dimensions participate (heavier; use when you truly need height-based rules).

Optionally name the container so nested layouts stay clear:

```css
.card-grid {
  container-type: inline-size;
  container-name: cards;
}
```

Shorthand:

```css
.card-grid {
  container: cards / inline-size;
}
```

## The `@container` rule

Inside a subtree, you write **`@container`** blocks that mirror `@media`, but the condition is evaluated against **ancestor query containers**—typically the nearest one unless you target a name.

```css
@container (min-width: 28rem) {
  .card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }
}
```

When the **container** (not the viewport) is at least `28rem` wide, those rules apply. The same `.card` markup can **stack** in a narrow rail and **split** in a wide main column, with **one stylesheet** and no duplicate breakpoints keyed to page templates.

### Named containers

If multiple wrappers could qualify, pin the query to a specific container:

```css
@container cards (min-width: 40rem) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

That reads cleanly in design systems: **“at this card track width, use three columns”—**not **“at this screen width, maybe three columns if we are on the right page.”**

## How this differs from `clamp()` and flex

Fluid type and spacing (`clamp()`, `min()`, viewport units) smooth scales **globally**. Flex and grid distribute **siblings** inside a parent. Container queries add **contextual breakpoints**: “when **this** layout region is wide enough, change **this** subtree.” They complement media queries—you still use `@media` for navigation patterns, page gutters, and coarse layout—but **component internals** often belong in `@container`.

## Practical pattern: one card, many homes

```css
.product-card {
  container-type: inline-size;
  container-name: product;
}

@container product (max-width: 20rem) {
  .product-card__actions {
    flex-direction: column;
  }
}

@container product (min-width: 36rem) {
  .product-card__media {
    aspect-ratio: 16 / 9;
  }
}
```

Drop that card into a marketing grid, a cart drawer, or a comparison table—the **local** width drives the **local** layout.

## Support and progressive enhancement

Container queries and `@container` are **widely available in current browsers**. For older environments, treat container-driven rules as **enhancement**: base styles work everywhere; `@container` blocks refine layout where supported. You can mirror critical breakpoints in `@media` only when you must support legacy clients—but many static and content sites can ship container queries alone.

---

If your breakpoints are labeled `sm:`, `md:`, `lg:` but the real variable is **“how wide is this widget,”** **`@container`** is the at-rule that finally matches how you think about the UI.
