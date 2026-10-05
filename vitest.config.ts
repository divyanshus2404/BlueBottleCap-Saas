import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json so tests import modules
    // by the same specifier the app uses.
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
