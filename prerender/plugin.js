import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const MARKER = "<!--prerender-login-->";

/**
 * Menyisipkan HTML halaman login (hasil render React sebenarnya) ke index.html.
 *
 * Mengapa: aplikasi ini SPA, jadi tanpa shell statis konten baru muncul setelah
 * JavaScript selesai diunduh & dijalankan. Akibatnya Largest Contentful Paint
 * (LCP) terlambat. Dengan shell ini LCP terjadi saat HTML pertama dicat, dan
 * React kemudian menggantikannya dengan DOM identik (tanpa layout shift).
 *
 * Cara kerja: prerender/entry.jsx dibundel dengan esbuild (React tetap external)
 * ke folder cache (CommonJS agar require("react") bekerja), dimuat di Node, lalu hasil renderToString disisipkan.
 */
export default function prerenderLoginShellPlugin() {
  return {
    name: "prerender-login-shell",
    apply: "build",
    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        if (!html.includes(MARKER)) return html;

        const outDir = resolve("node_modules/.cache/prerender");
        mkdirSync(outDir, { recursive: true });
        const outfile = resolve(outDir, `entry-${Date.now()}.cjs`);

        await build({
          entryPoints: [resolve("prerender/entry.jsx")],
          outfile,
          bundle: true,
          platform: "node",
          format: "cjs",
          jsx: "automatic",
          external: ["react", "react-dom", "react/jsx-runtime", "react-dom/server"],
          define: { DELCOM_BASEURL: '""' },
          logLevel: "error",
        });

        // Lingkungan Node tidak punya localStorage.
        const previous = globalThis.localStorage;
        globalThis.localStorage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };

        try {
          const { renderLoginShell } = createRequire(import.meta.url)(outfile);
          return html.replace(MARKER, renderLoginShell());
        } finally {
          globalThis.localStorage = previous;
        }
      },
    },
  };
}
