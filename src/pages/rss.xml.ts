import { SITE } from "src/config";
import rss from "@astrojs/rss";
import slugify from "@utils/slugify";
import { allPosts } from "@utils/allPosts";

export const GET = async () =>
  rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: allPosts
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(({ frontmatter }) => ({
        link: `posts/${slugify(frontmatter)}`,
        title: frontmatter.title,
        description: frontmatter.description,
        pubDate: new Date(frontmatter.datetime),
      })),
  });
