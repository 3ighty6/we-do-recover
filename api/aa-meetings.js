// Proxy endpoint to fetch AA TSML feeds (handles CORS)
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: "url required" });
  }
  
  try {
    const r = await fetch(decodeURIComponent(url), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WeDoRecover/1.0)" }
    });
    
    if (!r.ok) {
      return res.status(r.status).json({ error: `Feed returned ${r.status}` });
    }
    
    const data = await r.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
