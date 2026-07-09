export default async function handler(req, res) {
  const SUPA = "https://qdxufynzilmqzhortyrq.supabase.co";
  const SUPA_KEY = "sb_publishable_DH4eF8AYI5K57iS9I3z4bQ_KvR2me39";

  // AA TSML Intergroups - Curated list of known working feeds
  // Strategy: Query all feeds, aggregate results, let Meeting Guide data be the source of truth
  const AA_SOURCES = {
    // West Coast
    sfbay: { name: "AA San Francisco & Marin", url: "https://aasfmarin.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://aasfmarin.org" },
    la: { name: "AA Los Angeles", url: "https://www.aalosangeles.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aalosangeles.org" },
    seattle: { name: "AA Seattle", url: "https://www.aaseattle.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aaseattle.org" },
    
    // Mountain
    denver: { name: "AA Denver", url: "https://www.aadenver.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aadenver.org" },
    
    // Midwest
    chicago: { name: "AA Chicago", url: "https://www.aachicago.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aachicago.org" },
    
    // Northeast
    nyc: { name: "New York Inter-Group", url: "https://www.nyintergroup.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.nyintergroup.org" },
    boston: { name: "AA Boston", url: "https://www.aaboston.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aaboston.org" },
    
    // Other major metros
    dc: { name: "AA DC Area", url: "https://www.aadcarea.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aadcarea.org" },
    philly: { name: "AA Philadelphia", url: "https://www.aaphilly.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aaphilly.org" },
    atlanta: { name: "AA Atlanta", url: "https://www.aaatl.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aaatl.org" },
    miami: { name: "AA Miami", url: "https://www.aamillington.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aamillington.org" },
    houston: { name: "AA Houston", url: "https://www.aah.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aah.org" },
    austin: { name: "AA Austin", url: "https://www.aaaustin.org/wp-admin/admin-ajax.php?action=meetings", homepage: "https://www.aaaustin.org" },
  };
  
  const BMLT = "https://aggregator.bmltenabled.org/main_server/client_interface/json/";

  const FELLOWSHIPS = {
    AA:    { full: "Alcoholics Anonymous", live: "tsml", finder: "https://www.aa.org/find-aa" },
    NA:    { full: "Narcotics Anonymous", live: "bmlt", finder: "https://www.na.org/meetingsearch" },
    SMART: { full: "SMART Recovery", finder: "https://meetings.smartrecovery.org" },
    RR:    { full: "Refuge Recovery", finder: "https://www.refugerecovery.org" },
    WFS:   { full: "Women for Sobriety", finder: "https://womenforsobriety.org" },
    SOS:   { full: "Secular Organizations for Sobriety", finder: "https://www.sossobriety.org" },
    LR:    { full: "LifeRing Secular Recovery", finder: "https://lifering.org" },
    SR:    { full: "She Recovers", finder: "https://sherecovers.org" },
    CR:    { full: "Celebrate Recovery", finder: "https://www.celebraterecovery.com" },
  };

  function miles(a, b, c, d) {
    const R = 3958.8, dLat = ((c - a) * Math.PI) / 180, dLon = ((d - b) * Math.PI) / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  async function j(url, headers = {}) {
    const r = await fetch(url, { headers: { "User-Agent": "WeDoRecover/1.0", Accept: "application/json", ...headers } });
    if (!r.ok) throw new Error(`Upstream ${r.status} from ${new URL(url).host}`);
    return r.json();
  }

  async function getNA(lat, lng, radius) {
    const rows = await j(`${BMLT}?switcher=GetSearchResults&lat_val=${lat}&long_val=${lng}&geo_width=${radius}&sort_keys=weekday_tinyint,start_time`);
    if (!Array.isArray(rows)) return [];
    return rows.filter(m => m.latitude && m.longitude && m.meeting_name).map(m => {
      const la = +m.latitude, ln = +m.longitude;
      const city = m.location_municipality || "";
      return {
        fellowship: "NA", name: (m.meeting_name || "").trim(),
        day: (parseInt(m.weekday_tinyint, 10) - 1 + 7) % 7,
        time: (m.start_time || "").slice(0, 5),
        venue: m.location_text || "",
        address: [m.location_street, city, m.location_province].filter(Boolean).join(", "),
        city, lat: la, lng: ln, distance: +miles(lat, lng, la, ln).toFixed(1),
        formats: m.formats ? m.formats.split(",") : [],
        notes: m.comments || m.location_info || "",
        online_url: m.virtual_meeting_link || "",
        source: "BMLT worldwide directory", source_url: "https://bmlt.app", community: false,
      };
    });
  }

  async function getAA(lat, lng, radius) {
    // Aggregate from ALL AA TSML feeds (like Meeting Guide does)
    let allMeetings = [];
    const sources = [];
    
    // Fetch from all feeds in parallel, ignore individual failures
    const promises = Object.entries(AA_SOURCES).map(async ([key, src]) => {
      try {
        const rows = await j(src.url);
        if (Array.isArray(rows)) {
          const mapped = rows
            .filter(m => m.latitude && m.longitude && m.name && m.day != null && m.time)
            .map(m => {
              const la = +m.latitude, ln = +m.longitude;
              const d = +miles(lat, lng, la, ln).toFixed(1);
              return {
                fellowship: "AA", name: String(m.name).trim(), day: parseInt(m.day, 10),
                time: String(m.time).slice(0, 5), venue: m.location || "",
                address: m.formatted_address || "", city: m.region || "",
                lat: la, lng: ln, distance: d,
                formats: Array.isArray(m.types) ? m.types : [],
                notes: m.notes || "", online_url: m.conference_url || "",
                source: src.name, source_url: src.homepage, community: false,
              };
            })
            .filter(m => m.distance <= radius);
          if (mapped.length > 0) {
            allMeetings.push(...mapped);
            sources.push(src.name);
          }
        }
      } catch (err) {
        // Silently continue to next feed
      }
    });
    
    await Promise.all(promises);
    
    // Deduplicate by name + time + location (same meeting listed multiple places)
    const seen = new Set();
    const unique = [];
    for (const m of allMeetings) {
      const key = `${m.name}|${m.time}|${m.venue}|${m.city}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(m);
      }
    }
    
    return { meetings: unique, src: { name: sources.length > 0 ? `AA Meetings (${sources.length} sources)` : "AA Meetings", homepage: "https://www.aa.org/find-aa" } };
  }

  async function getCommunity(fellowship, lat, lng, radius) {
    try {
      const rows = await j(
        `${SUPA}/rest/v1/approved_meetings?fellowship=eq.${encodeURIComponent(fellowship)}&kind=eq.new&select=*`,
        { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
      );
      return rows.map(m => {
        const has = m.lat != null && m.lng != null;
        const d = has ? +miles(lat, lng, m.lat, m.lng).toFixed(1) : null;
        return {
          fellowship, name: m.meeting_name, day: m.day, time: m.time || "",
          venue: m.venue || "", address: m.address || "", city: m.city || "",
          lat: m.lat, lng: m.lng, distance: d,
          formats: [], notes: m.details || "", online_url: m.online_url || "",
          source: "Community submission", source_url: "", community: true,
        };
      }).filter(m => m.distance == null || m.distance <= radius);
    } catch (e) { return []; }
  }

  async function getNotices(fellowship, lat, lng, radius) {
    try {
      const now = new Date().toISOString();
      const rows = await j(
        `${SUPA}/rest/v1/approved_meetings?fellowship=eq.${encodeURIComponent(fellowship)}&kind=in.(temporary,change,remove)&select=*&order=created_at.desc&limit=25`,
        { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
      );
      const cutoff = Date.now() - 21 * 86400e3;
      return rows.filter(n => {
        if (n.kind === "temporary") return !n.expires_at || n.expires_at > now;
        return new Date(n.created_at).getTime() > cutoff;
      }).filter(n => {
        if (n.lat == null || n.lng == null) return true;
        return miles(lat, lng, n.lat, n.lng) <= Math.max(radius, 25) * 2;
      }).map(n => ({
        kind: n.kind, meeting_name: n.meeting_name, details: n.details || "",
        day: n.day, time: n.time, city: n.city || "", expires_at: n.expires_at,
      })).slice(0, 8);
    } catch (e) { return []; }
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=21600");

  const { fellowship = "NA", lat, lng, radius = "25" } = req.query;
  const la = parseFloat(lat), ln = parseFloat(lng);
  const rad = Math.min(Math.max(parseFloat(radius) || 25, 1), 100);
  const F = FELLOWSHIPS[fellowship];
  if (isNaN(la) || isNaN(ln)) return res.status(400).json({ error: "lat and lng are required" });
  if (!F) return res.status(400).json({ error: "Unknown fellowship" });

  const out = {
    fellowship, full_name: F.full, official_finder: F.finder,
    has_live_feed: !!F.live, radius_miles: rad,
    fetched_at: new Date().toISOString(),
    meetings: [], notices: [], source: null,
  };

  const tasks = [];
  if (F.live === "bmlt") tasks.push(getNA(la, ln, rad).then(m => { out.meetings.push(...m); out.source = { name: "BMLT worldwide directory", homepage: "https://bmlt.app" }; }));
  if (F.live === "tsml") tasks.push(getAA(la, ln, rad).then(r => { out.meetings.push(...r.meetings); out.source = { name: r.src.name, homepage: r.src.homepage }; }));
  tasks.push(getCommunity(fellowship, la, ln, rad).then(m => out.meetings.push(...m)));
  tasks.push(getNotices(fellowship, la, lng, rad).then(n => { out.notices = n; }));

  try {
    await Promise.all(tasks);
  } catch (err) {
    if (out.meetings.length === 0) {
      return res.status(502).json({ error: "Could not reach the meeting directory right now.", detail: String(err.message || err), official_finder: F.finder });
    }
  }

  out.meetings.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
  out.count = out.meetings.length;
  out.meetings = out.meetings.slice(0, 300);
  if (!out.source) out.source = { name: "Community submissions", homepage: F.finder };
  return res.status(200).json(out);
}
