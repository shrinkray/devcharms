import type { MarkdownInstance } from "astro";
import type { Frontmatter } from "src/types";

const postModules = import.meta.glob<MarkdownInstance<Frontmatter>>(
  "../contents/**/*.md",
  { eager: true },
);

export const allPosts = Object.values(postModules);
