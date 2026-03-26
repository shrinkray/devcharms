---
author: Greg Miller
datetime: 2026-03-26T15:00:00Z
title: Before I hit publish on a static site
slug: before-i-hit-publish-on-a-static-site
featured: false
draft: false
tags:
  - astro
  - workflow
  - quality
ogImage: ""
description:
  A short pre-flight checklist for shipping static sites—build, links, SEO basics, and the
  one grep that catches embarrassing typos in slugs.
---

Shipping a static site can feel low risk until you remember there is **no server to patch later** for a broken RSS path or a typo in canonical URLs. The safety net is discipline before deploy.

Here is the checklist I actually run through—not exhaustive, but enough to catch the mistakes that waste an evening.

## Table of contents

## Build and smoke

Run a production build locally and fix every warning you agree matters. Open the generated `dist` (or let CI artifacts do it) and click the pages that changed—not only the homepage.

## Links and slugs

If you renamed posts or slugs, **search the repo** for old paths and for internal links that still point at retired URLs. Static hosts will happily serve `404` forever.

## Social and feeds

Regenerate or inspect `rss.xml` and any sitemap output. Feed readers do not forgive a bad link, and search engines notice when metadata drifts from the page title.

## Content passes

Read the new post aloud once. Fix awkward sentences and check code fences. If you reference "today" or "this week," decide whether it will age badly—and trim if it will.

## Done

The goal is not perfection on day one. It is **confidence** that what you shipped matches what you think you shipped. The rest can ride in the next small change.
