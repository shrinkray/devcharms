---
author: Greg Miller
datetime: 2025-03-05T14:30:00Z
title: The bug that taught me to read the docs
slug: the-bug-that-taught-me-to-read-the-docs
featured: true
draft: false
tags:
  - debugging
  - habits
ogImage: ""
description:
  A short story about chasing a "mystery" production issue that turned out to be
  documented behavior—and what I changed in how I work afterward.
---

I once burned most of a day on a bug that felt like a framework betrayal. Symptoms only showed up in production. Local looked perfect. Logs were noisy but unhelpful. I rewrote a hook, then a data layer, then blamed the CDN.

The fix was a single line in the official docs, in a section I had skimmed because the heading looked boring.

The behavior was **exactly** what the docs described: a default I had assumed was universal was only true in development. Production did the stricter, spec-correct thing. I had been "debugging" my own confirmation bias.

## Table of contents

## What I do differently now

Before I refactor or rip out a dependency, I open the docs for the failing path and search for the error string or the API name. If the framework authors already named the edge case, I want to see that paragraph first—not after I have painted myself into a corner.

The bug was embarrassing. The habit stuck.
