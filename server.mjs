import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID;
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json" };
function send(res, status, body, type = "application/json") { res.writeHead(status, { "content-type": type }); res.end(body); }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/search") {
    const query = url.searchParams.get("q")?.trim();
    const provider = url.searchParams.get("provider") || process.env.SEARCH_PROVIDER || "duckduckgo";
    if (!query) return send(res, 400, JSON.stringify({ error: "Missing query" }));
    try {
      if (provider === "duckduckgo") {
        const endpoint = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await fetch(endpoint, { headers: { "user-agent": "NOVA-Search/1.0" } });
        const html = await response.text();
        const items = [...html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].slice(0, 10).map((match) => ({ link: match[1].replace(/&amp;/g, "&"), title: match[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&"), displayLink: "DuckDuckGo", snippet: "" }));
        return send(res, response.ok ? 200 : response.status, JSON.stringify({ items }));
      }
      if (provider !== "google" || !googleKey || !googleCx) return send(res, 503, JSON.stringify({ error: "Google API configuration is missing" }));
      const endpoint = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(googleKey)}&cx=${encodeURIComponent(googleCx)}&q=${encodeURIComponent(query)}`;
      const response = await fetch(endpoint); res.writeHead(response.status, { "content-type": "application/json" }); return res.end(await response.text());
    }
    catch { return send(res, 502, JSON.stringify({ error: "Google search request failed" })); }
  }
  const requested = url.pathname === "/" ? "/index.html" : (url.pathname === "/important-links" || url.pathname === "/important-links/" ? "/webinportantlink/index.html" : url.pathname);
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root) || !fs.existsSync(file)) return send(res, 404, "Not found", "text/plain");
  res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" }); fs.createReadStream(file).pipe(res);
});
server.listen(port, () => console.log(`NOVA running at http://localhost:${port}`));
