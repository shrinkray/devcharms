import { SITE } from "src/config";
import rss from "@astrojs/rss";
import slugify from "@utils/slugify";
import { allPosts } from "@utils/allPosts";

export const GET = async () => {
  const items = await Promise.all(
    allPosts
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(async (post) => ({
        link: `posts/${slugify(post.frontmatter)}`,
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        pubDate: new Date(post.frontmatter.datetime),
        categories: post.frontmatter.tags?.slice(0, 4) ?? [],
        content: await post.compiledContent(),
      })),
  );

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items,
  });
};
