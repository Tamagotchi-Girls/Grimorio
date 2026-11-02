import { defineConfig } from "vitest/config";

// Config propia (sin los plugins de vite.config.ts): las pruebas solo cubren lógica y datos,
// no necesitan React ni Tailwind.
export default defineConfig({
  test: {
    include: ["src/**/*.test.js"],
    environment: "node",
  },
});
