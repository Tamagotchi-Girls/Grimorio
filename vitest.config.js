import { defineConfig } from "vitest/config";

// Config propia (sin los plugins de vite.config.ts): las pruebas cubren lógica, datos y el HTML de los
// componentes (renderToStaticMarkup, sin navegador), no necesitan Tailwind. JSX con el runtime automático
// para poder renderizar los .jsx sin importar React.
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["src/**/*.test.js"],
    environment: "node",
  },
});
