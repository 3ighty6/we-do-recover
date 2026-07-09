// Minimal API - just returns config, all data fetching done client-side
export default async function handler(req, res) {
  const SUPA = "https://qdxufynzilmqzhortyrq.supabase.co";
  const SUPA_KEY = "sb_publishable_DH4eF8AYI5K57iS9I3z4bQ_KvR2me39";
  const BMLT = "https://aggregator.bmltenabled.org/main_server/client_interface/json/";

  const FELLOWSHIPS = {
    AA:    { full: "Alcoholics Anonymous", finder: "https://www.aa.org/find-aa" },
    NA:    { full: "Narcotics Anonymous", finder: "https://www.na.org/meetingsearch" },
    SMART: { full: "SMART Recovery", finder: "https://meetings.smartrecovery.org" },
    RR:    { full: "Refuge Recovery", finder: "https://www.refugerecovery.org" },
    WFS:   { full: "Women for Sobriety", finder: "https://womenforsobriety.org" },
    SOS:   { full: "Secular Organizations for Sobriety", finder: "https://www.sossobriety.org" },
    LR:    { full: "LifeRing Secular Recovery", finder: "https://lifering.org" },
    SR:    { full: "She Recovers", finder: "https://sherecovers.org" },
    CR:    { full: "Celebrate Recovery", finder: "https://www.celebraterecovery.com" },
  };

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300");

  const { fellowship = "NA", lat, lng, radius = "25" } = req.query;
  const la = parseFloat(lat), ln = parseFloat(lng);
  const rad = Math.min(Math.max(parseFloat(radius) || 25, 1), 100);
  const F = FELLOWSHIPS[fellowship];

  if (isNaN(la) || isNaN(ln)) return res.status(400).json({ error: "lat and lng required" });
  if (!F) return res.status(400).json({ error: "Unknown fellowship" });

  // Return config for client-side fetching
  return res.status(200).json({
    fellowship,
    full_name: F.full,
    official_finder: F.finder,
    bmlt_url: fellowship === "NA" ? `${BMLT}?switcher=GetSearchResults&lat_val=${la}&long_val=${ln}&geo_width=${rad}&sort_keys=weekday_tinyint,start_time` : null,
    supabase_url: `${SUPA}/rest/v1/approved_meetings?fellowship=eq.${encodeURIComponent(fellowship)}&select=*`,
    supabase_key: SUPA_KEY,
    radius_miles: rad,
    fetched_at: new Date().toISOString(),
  });
}
