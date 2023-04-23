import type { TinaField } from "tinacms";
export function blog_postFields() {
  return [
    {
      type: "string",
      name: "author",
      label: "author",
      required: true,
    },
    {
      type: "datetime",
      name: "datetime",
      label: "datetime",
      required: true,
    },
    {
      type: "string",
      name: "title",
      label: "title",
      required: true,
    },
    {
      type: "string",
      name: "slug",
      label: "slug",
      required: true,
    },
    {
      type: "boolean",
      name: "featured",
      label: "featured",
    },
    {
      type: "boolean",
      name: "draft",
      label: "draft",
    },
    {
      type: "string",
      name: "tags",
      label: "tags",
      list: true,
    },
    {
      type: "string",
      name: "ogImage",
      label: "ogImage",
    },
    {
      type: "string",
      name: "description",
      label: "description",
      required: true,
    },
  ] as TinaField[];
}
