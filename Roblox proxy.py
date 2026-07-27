// ==========================================
// TDU Roblox Proxy — Vercel Serverless Function
// ==========================================
// Datei liegt unter /api/roblox-proxy.js im Projekt-Root -> Vercel deployt sie
// automatisch als Endpoint unter:  https://deine-domain.vercel.app/api/roblox-proxy
//
// Da diese Function auf der GLEICHEN Domain läuft wie deine Website,
// ist das ein Same-Origin-Request -> kein CORS-Proxy-Umweg mehr nötig,
// keine 403-Sperren von corsproxy.io mehr möglich.
//
// Aufruf vom Frontend: /api/roblox-proxy?url=<encodeURIComponent(zielUrl)>

// Nur diese Roblox-Endpunkte werden durchgelassen (verhindert Missbrauch als offener Proxy).
const ALLOWED_TARGET_PREFIXES = [
    "https://groups.roblox.com/",
    "https://thumbnails.roblox.com/"
];

export default async function handler(req, res) {
    // Kurzes Edge-Caching, schont Rate-Limits der Roblox-API bei vielen Seitenaufrufen.
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const target = req.query.url;

    if (!target || typeof target !== "string") {
        return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    const isAllowed = ALLOWED_TARGET_PREFIXES.some(prefix => target.startsWith(prefix));
    if (!isAllowed) {
        return res.status(403).json({ error: "Target URL not permitted" });
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
