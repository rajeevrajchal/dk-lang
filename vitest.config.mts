import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Same "@/..." alias the app uses, so tests import modules exactly the way
    // application code does.
    alias: { "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".") },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
