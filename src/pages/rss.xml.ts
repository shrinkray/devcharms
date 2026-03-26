import { SITE } from "src/config";
import rss from "@astrojs/rss";
import type { Frontmatter } from "src/types";
import type { MarkdownInstance } from "astro";
import slugify from "@utils/slugify";

const postImportResult = import.meta.glob<MarkdownInstance<Frontmatter>>(
  "../contents/**/**/*.md",
  {
    eager: true,
  },
);
const posts = Object.values(postImportResult);

export const GET = async () => {
  const { body } = await rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: posts
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(({ frontmatter }) => ({
        link: `posts/${slugify(frontmatter)}`,
        title: frontmatter.title,
        description: frontmatter.description,
        pubDate: new Date(frontmatter.datetime),
      })),
  });
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
