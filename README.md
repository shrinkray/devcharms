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

Requires **Node.js 22+**.

```bash
git clone https://github.com/shrinkray/devcharms.git
cd devcharms
npm install
npm run dev
```

The dev server starts at [localhost:4321](http://localhost:4321) (Astro's default).

## Commands

| Command                | Action                                     |
| :--------------------- | :----------------------------------------- |
| `npm install`          | Install dependencies                       |
| `npm run dev`          | Start local dev server                     |
| `npm run dev:host`     | Start dev server accessible on the network |
| `npm run build`        | Build the production site to `./dist/`     |
| `npm run preview`      | Preview the production build locally       |
| `npm run format:check` | Check formatting with Prettier             |
| `npm run format`       | Format files with Prettier                 |
| `npm run cz`           | Commit with Commitizen                     |

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
