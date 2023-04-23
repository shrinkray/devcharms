
import { defineConfig } from "tinacms";
import { blog_postFields } from "./templates";
import dotenv from "dotenv";
dotenv.config();

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
const config = {
  clientID: process.env.CLIENT_ID || "",
  clientToken: process.env.TOKEN || "",
};

export default defineConfig({
  branch,
  clientId: config.clientID, // Get this from tina.io
  token: config.clientToken, // Get this from tina.io
  client: { skip: true },
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        format: "md",
        label: "Blog Posts",
        name: "blog_posts",
        path: "src/contents",
        match: {
          include: "**/*",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
          ...blog_postFields(),
        ],
      },
    ],
  },
});
