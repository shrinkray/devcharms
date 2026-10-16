# DevCharms

![DevCharms](public/assets/devcharms-og.jpg)

**DevCharms** is [Greg Miller](https://www.linkedin.com/in/gregraymiller/)'s software development blog and portfolio—engineering notes, code snippets from challenges and experiments, and stories from shipping real work.

Live site: [devcharms.com](https://devcharms.com)

## Features

- Static site generation with [Astro](https://astro.build/) for fast loads and minimal JavaScript
- Markdown blog posts with syntax highlighting, table of contents, and draft support
- Tag pages, featured posts, and pagination
- Fuzzy search (React + Fuse.js)
- Light and dark mode
- RSS feed at [`/rss.xml`](https://devcharms.com/rss.xml) and sitemap generation
- SEO-friendly metadata and accessible markup

## Tech Stack

- **Framework** — [Astro](https://astro.build/)
- **Language** — [TypeScript](https://www.typescriptlang.org/)
- **UI** — [React](https://react.dev/) (search only)
- **Styling** — [Tailwind CSS](https://tailwindcss.com/)
- **Search** — [Fuse.js](https://fusejs.io/)
- **Analytics** — [Partytown](https://partytown.builder.io/) (third-party scripts off the main thread)

## Getting Started

Requires **Node.js 22.22+** and [pnpm](https://pnpm.io/) 11 (`corepack enable` picks up the version pinned in `package.json`).

```bash
git clone https://github.com/shrinkray/devcharms.git
cd devcharms
pnpm install
pnpm dev
```

The dev server starts at [localhost:4321](http://localhost:4321) (Astro's default).

## Commands

| Command             | Action                                     |
| :------------------ | :----------------------------------------- |
| `pnpm install`      | Install dependencies                       |
| `pnpm dev`          | Start local dev server                     |
| `pnpm dev:host`     | Start dev server accessible on the network |
| `pnpm build`        | Build the production site to `./dist/`     |
| `pnpm preview`      | Preview the production build locally       |
| `pnpm format:check` | Check formatting with Prettier             |
| `pnpm format`       | Format files with Prettier                 |
| `pnpm cz`           | Commit with Commitizen                     |

## Dependency security

pnpm is configured in [`pnpm-workspace.yaml`](pnpm-workspace.yaml):

- **Install scripts are blocked by default.** Only packages listed under `allowBuilds` (currently `esbuild`, `sharp`) may run them. With `strictDepBuilds`, adding a dependency that has a native build step makes `pnpm install` **fail** until you review it and add it to `allowBuilds`. That failure is the guardrail working.
- **Release cooldown.** `minimumReleaseAge` refuses versions published in the last 24 hours. If an install fails on a very fresh version, the cooldown is doing its job: wait a day or take the previous version. Don't disable it.
- **Overrides** (security pins for `lodash` and `tmp`) live under `overrides` in `pnpm-workspace.yaml`, not `package.json`.
- `trustPolicyExclude` holds narrow, version-pinned exceptions to the trust-downgrade check, each with a note in the file. Remove them when they stop being needed.

## Project Structure

```bash
/
├── public/              # Static assets (favicons, OG image, robots.txt)
├── src/
│   ├── assets/        # Icons and other bundled assets
│   ├── components/    # Astro and React components
│   ├── contents/      # Blog posts (Markdown)
│   ├── layouts/       # Page layouts
│   ├── pages/         # Routes (file-based routing)
│   ├── styles/        # Global styles
│   ├── utils/         # Helpers (posts, tags, slugs)
│   └── config.ts      # Site title, author, social links
├── astro.config.mjs
└── package.json
```

Blog posts live in `src/contents/` as `.md` files with frontmatter (`title`, `description`, `datetime`, `tags`, etc.). Each file in `src/pages/` becomes a route automatically.

Site-wide settings—title, description, social links, posts per page—are in [`src/config.ts`](src/config.ts).

## Adding a Post

Create a new Markdown file in `src/contents/`:

```md
---
author: Greg Miller
datetime: 2026-06-20T12:00:00Z
title: Your Post Title
slug: your-post-slug
featured: false
draft: false
tags:
  - css
  - astro
description: A short summary for SEO and card previews.
---

Your content here.
```

Posts with `draft: true` are excluded from production builds. Set `featured: true` to surface a post on the homepage.

## Credits

This site started from the [AstroPaper](https://github.com/satnaing/astro-paper) theme by [Sat Naing](https://satnaing.dev). The content, branding, and ongoing development are DevCharms.

## License

MIT — see [LICENSE](LICENSE).
