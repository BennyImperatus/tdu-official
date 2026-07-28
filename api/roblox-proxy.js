// ==========================================
// TDU Roblox Proxy — Vercel Serverless Function
// ==========================================
// Datei liegt unter /api/roblox-proxy.js im Projekt-Root -> Vercel deployt sie
// automatisch als Endpoint unter:  https://deine-domain.vercel.app/api/roblox-proxy
//
// Same-Origin-Request vom Frontend -> kein CORS-Proxy-Umweg mehr nötig.
// Aufruf: /api/roblox-proxy?url=<encodeURIComponent(zielUrl)>

const ALLOWED_TARGET_PREFIXES = [
    "https://groups.roblox.com/",
    "https://thumbnails.roblox.com/"
];

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // WICHTIG: url-Parameter direkt aus req.url parsen statt über req.query,
    // das ist unabhängig von Runtime-Details zuverlässig.
    let target;
    try {
        const fullUrl = new URL(req.url, `https://${req.headers.host || "localhost"}`);
        target = fullUrl.searchParams.get("url");
    } catch (parseErr) {
        return res.status(400).json({ error: "Could not parse request URL", detail: parseErr.message });
    }

    if (!target) {
        return res.status(400).json({ error: "Missing 'url' query parameter", rawUrl: req.url });
    }

    const isAllowed = ALLOWED_TARGET_PREFIXES.some(prefix => target.startsWith(prefix));
    if (!isAllowed) {
        return res.status(403).json({ error: "Target URL not permitted", target });
    }

    try {
        const robloxResponse = await fetch(target, {
            headers: { "Accept": "application/json" }
        });

        const body = await robloxResponse.text();

        res.status(robloxResponse.status);
        res.setHeader("Content-Type", robloxResponse.headers.get("Content-Type") || "application/json");
        return res.send(body);
    } catch (err) {
        return res.status(502).json({ error: "Upstream fetch failed", detail: err.message });
    }
}
