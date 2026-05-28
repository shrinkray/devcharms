import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const shimDir = path.join(root, "node_modules", "@vite", "env");

await fs.mkdir(shimDir, { recursive: true });

const pkgJsonPath = path.join(shimDir, "package.json");
const indexPath = path.join(shimDir, "index.mjs");

await fs.writeFile(
  pkgJsonPath,
  JSON.stringify(
    {
      name: "@vite/env",
      version: "0.0.0",
      private: true,
      type: "module",
      exports: { ".": "./index.mjs" },
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

await fs.writeFile(
  indexPath,
  'import "vite/dist/client/env.mjs";\n\nexport {};\n',
  "utf8",
);
