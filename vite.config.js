import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Menyisipkan CSS hasil build langsung ke index.html agar tidak ada
// stylesheet yang memblokir render (Eliminate render-blocking resources).
function inlineCssPlugin() {
  return {
    name: "inline-css",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        // Tag penutup </body></html> bersifat opsional di HTML. Tanpa </body>,
        // Netlify tidak menyuntikkan skrip Drawer (/.netlify/scripts/hud) ke halaman.
        html = html.replace(/\s*<\/body>\s*<\/html>\s*$/i, "\n");
        return html.replace(
          /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
          (tag, href) => {
            const key = href.replace(/^\//, "");
            const asset = ctx.bundle[key];
            if (!asset || asset.type !== "asset") return tag;
            delete ctx.bundle[key];
            return `<style>${asset.source}</style>`;
          }
        );
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), inlineCssPlugin()],
    server: {
      port: Number(env.APP_PORT) || 3000,
    },
    preview: {
      port: Number(env.APP_PORT) || 3000,
    },
    build: {
      cssCodeSplit: false,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,jsx,ts,tsx}"],
        exclude: [
          "src/main.jsx",
          "src/setupTests.js",
          "src/test-utils.jsx",
          "**/*.test.{js,jsx}",
          "node_modules/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
