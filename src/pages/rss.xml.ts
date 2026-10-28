import { SITE } from "src/config";
import rss from "@astrojs/rss";
import slugify from "@utils/slugify";
import { allPosts } from "@utils/allPosts";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";

export const prerender = true;

const siteOrigin = SITE.website.replace(/\/$/, "");

function absoluteUrl(value: string, base: string) {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function absoluteSrcset(value: string, base: string) {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";
      const [url, ...descriptors] = trimmed.split(/\s+/);
      return [absoluteUrl(url, base), ...descriptors].join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

/** Feed readers do not load the site stylesheet, so relative links and Shiki styles fail validation. */
function cleanFeedHtml(html: string, postUrl: string) {
  const $ = cheerio.load(html, null, false);

  // The dark diagram is only shown with the theme stylesheet.
  $(".theme-img--dark").remove();

  $("[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href) return;
    $(el).attr("href", absoluteUrl(href, postUrl));
  });

  $("[src]").each((_, el) => {
    const src = $(el).attr("src")?.trim();
    if (!src || src.startsWith("data:")) return;
    $(el).attr("src", absoluteUrl(src, postUrl));
  });

  $("[poster]").each((_, el) => {
    const poster = $(el).attr("poster")?.trim();
    if (!poster) return;
    $(el).attr("poster", absoluteUrl(poster, postUrl));
  });

  $("[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset")?.trim();
    if (!srcset) return;
    $(el).attr("srcset", absoluteSrcset(srcset, postUrl));
  });

  return sanitizeHtml($.html(), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "details",
      "summary",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "title"],
      img: ["src", "srcset", "alt", "title", "width", "height"],
      "*": ["id"],
    },
  });
}

export const GET = async () => {
  const items = await Promise.all(
    allPosts
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(async (post) => {
        // Canonical post URLs end with a slash. Without it the site returns
        // 308, and importers that do not follow that redirect fail the item.
        const postUrl = new URL(
          `/posts/${slugify(post.frontmatter)}/`,
          siteOrigin,
        ).toString();

        return {
          link: postUrl,
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          pubDate: new Date(post.frontmatter.datetime),
          categories: post.frontmatter.tags?.slice(0, 4) ?? [],
          content: cleanFeedHtml(await post.compiledContent(), postUrl),
        };
      }),
  );

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    customData: `<atom:link href="${siteOrigin}/rss.xml" rel="self" type="application/rss+xml"/>`,
    items,
  });
};
