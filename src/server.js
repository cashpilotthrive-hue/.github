import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";
import { creditEngine } from "./creditEngine.js";

const publicDir = join(process.cwd(), "public");
const sseClients = new Set();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function pushSse(type, payload) {
  const frame = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    client.write(frame);
  }
}

creditEngine.emitter.on("credit", (event) => {
  pushSse("credit", event);
  pushSse("totals", creditEngine.getTotals());
});

async function serveStatic(urlPath, res) {
  const cleanPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = join(publicDir, cleanPath);
  const ext = extname(filePath);
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("Payload too large"));
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  if (!req.url) return sendJson(res, 400, { error: "Missing URL" });
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/api/credits") {
    const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit")) || 50, 500));
    return sendJson(res, 200, { events: creditEngine.getRecent(limit), totals: creditEngine.getTotals() });
  }

  if (req.method === "POST" && url.pathname === "/api/credits") {
    try {
      const payload = await parseBody(req);
      const event = creditEngine.addEvent(payload);
      return sendJson(res, 201, { event });
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  if (req.method === "GET" && url.pathname === "/credits/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write(`event: snapshot\ndata: ${JSON.stringify({ events: creditEngine.getRecent(25), totals: creditEngine.getTotals() })}\n\n`);

    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  return serveStatic(url.pathname, res);
});

function seedDemoEvents() {
  const samples = [
    { amount: 42_000_000, source_type: "BANK", description: "Incoming wire from Prime Custody" },
    { amount: 165_000_000, source_type: "P_AND_L", description: "Intraday derivatives settlement" },
    { amount: 1_240_000_000, source_type: "YIELD", description: "Quarterly sovereign coupon credit" },
  ];

  for (const sample of samples.reverse()) {
    creditEngine.addEvent({
      ...sample,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3_600_000)).toISOString(),
    });
  }
}

seedDemoEvents();

const port = Number(process.env.PORT) || 4000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Credit alert app running at http://localhost:${port}`);
});
