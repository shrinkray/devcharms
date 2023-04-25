
import { defineConfig } from "tinacms";
import { blog_postFields } from "./templates";
import * as dotenv from "dotenv";
dotenv.config();

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
const CLIENT_ID: string = process.env.CLIENT_ID || "";
const TOKEN: string = process.env.TOKEN || "";

if (!CLIENT_ID || !TOKEN) {
  console.error("Environment variables are missing. Please check your .env file.");
  process.exit(1);
}
export { CLIENT_ID, TOKEN };

export default defineConfig({
  branch,
  clientId: CLIENT_ID, // Get this from tina.io
  token: TOKEN, // Get this from tina.io
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
