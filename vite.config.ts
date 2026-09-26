import https from "node:https";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const R2_HOST = /^[a-z0-9]+\.r2\.cloudflarestorage\.com$/i;

/**
 * Browser PUTs to R2 from localhost are blocked by bucket CORS.
 * Same-origin /__r2/<host>/path?signed forwards the file so local uploads work.
 */
function r2DevProxy(): Plugin {
  return {
    name: "r2-dev-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/__r2/")) return next();
        proxyR2(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/__r2/")) return next();
        proxyR2(req, res);
      });
    },
  };
}

function proxyR2(req: IncomingMessage, res: ServerResponse) {
  const rest = (req.url || "").slice("/__r2/".length);
  const slash = rest.indexOf("/");
  const host = slash === -1 ? rest.split("?")[0] : rest.slice(0, slash);
  if (!R2_HOST.test(host)) {
    res.statusCode = 400;
    res.end("Invalid storage host");
    return;
  }
  const pathAndQuery = slash === -1 ? `/${rest.slice(host.length)}` : rest.slice(slash);
  const headers: Record<string, string | string[] | undefined> = {
    ...req.headers,
    host,
  };
  delete headers.origin;
  delete headers.referer;
  delete headers.connection;

  const upstream = https.request(
    {
      hostname: host,
      path: pathAndQuery,
      method: req.method,
      headers,
    },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    }
  );
  upstream.on("error", (err) => {
    if (!res.headersSent) res.statusCode = 502;
    res.end(err.message);
  });
  req.pipe(upstream);
}

export default defineConfig({
  plugins: [react(), r2DevProxy()],
});
