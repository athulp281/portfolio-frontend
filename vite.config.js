import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Dev-only bridge so the Vercel serverless functions in `/api` also run under
 * `npm run dev`. In production Vercel serves these; locally Vite doesn't, so the
 * admin login/save would 404. This middleware maps `/api/<x>` → `./api/<x>.js`,
 * builds a Vercel-like (req,res) and invokes the same handler — no code dupes.
 *
 * Server-side env (ADMIN_PASSWORD, GITHUB_*) is read from `.env` (any name,
 * not just VITE_*) and backfilled into process.env for the handlers.
 */
function vercelApiDev(env) {
  const SERVER_KEYS = [
    "ADMIN_PASSWORD",
    "GITHUB_TOKEN",
    "GITHUB_REPO",
    "GITHUB_BRANCH",
    "GITHUB_FILE_PATH",
  ];
  for (const k of SERVER_KEYS) {
    if (!process.env[k] && env[k]) process.env[k] = env[k];
  }

  return {
    name: "vercel-api-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();
        try {
          const url = new URL(req.url, "http://localhost");
          const sub = url.pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
          const file = path.resolve(__dirname, "api", `${sub}.js`);

          req.body = await readBody(req);
          patchRes(res);

          const mod = await import(pathToFileURL(file).href);
          if (typeof mod.default !== "function") {
            res.status(404).json({ ok: false, error: `No handler for /api/${sub}` });
            return;
          }
          await mod.default(req, res);
        } catch (err) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
          }
        }
      });
    },
  };
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.method === "GET" || req.method === "HEAD") return resolve(undefined);
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      const ct = req.headers["content-type"] || "";
      if (ct.includes("application/json") && data) {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({});
        }
      } else {
        resolve(data || undefined);
      }
    });
    req.on("error", () => resolve(undefined));
  });
}

function patchRes(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    if (!res.getHeader("Content-Type")) {
      res.setHeader("Content-Type", "application/json");
    }
    res.end(JSON.stringify(obj));
    return res;
  };
}

export default defineConfig(({ mode }) => {
  // "" = no prefix filter, so server-only vars (ADMIN_PASSWORD, GITHUB_*) load too.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), vercelApiDev(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      open: true,
    },
    build: {
      target: "es2020",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three", "@react-three/fiber", "@react-three/drei"],
            motion: ["framer-motion"],
            markdown: ["react-markdown", "react-syntax-highlighter", "remark-gfm"],
          },
        },
      },
    },
  };
});
