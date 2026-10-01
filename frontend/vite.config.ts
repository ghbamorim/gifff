import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    reporters: ["verbose"],
    pool: "vmThreads",

    coverage: {
      provider: "v8",
      reporter: ["text"],

      include: ["src/**/*.{ts,tsx}"],

      exclude: ["src/**/*.d.ts", "src/main.tsx", "src/test/**"],
    },
  },
});
