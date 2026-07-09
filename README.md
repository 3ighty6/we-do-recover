# We Do Recover — Meeting Finder

Free, public-facing recovery meeting finder supporting **9 pathways**: AA, NA, SMART Recovery, Refuge Recovery, Women for Sobriety, S.O.S., LifeRing, She Recovers, and Celebrate Recovery.

**Live:** https://we-do-recover.vercel.app  
**Moderation Dashboard:** https://we-do-recover.vercel.app/moderation.html  
**GitHub:** https://github.com/3ighty6/we-do-recover

---

## 🎯 Core Principle

**Hybrid data model:** Live official feeds (where available) + community submissions + always-available official finders.

- **AA, NA** — Live TSML/BMLT feeds + community submissions
- **SMART, RR, WFS, SOS, LR, SR, CR** — Community submissions + official finders

Users can submit new meetings, report changes, or note closures. All submissions are reviewed within 24 hours before appearing live.

---

## 🏗️ Architecture

### Frontend (`index.html`)
- **PWA** — Installable on homescreen (blue recovery-book theme)
- **Responsive** — Mobile-first design
- **Location-based** — Auto-detects user location
- **Real-time filtering** — Fellowship, day, time, radius
- **Zero tracking** — No analytics, no cookies

### Backend (`api/meetings.js`, Vercel serverless)
- **Fetches live feeds** — NA BMLT, AA TSML (NYC + SF)
- **Queries community submissions** — Supabase approved_meetings view
- **Returns all** layered together (live + community)
- **Caching** — 30-min cache, 6-hour revalidation

### Database (`Supabase`)
- **Public table:** `submissions` (RLS-protected, anon inserts only)
- **Public view:** `approved_meetings` (hides contact, shows status=approved only)
- **Moderation:** Manual status updates via dashboard

---

## 📊 Data Sources

### AA (Alcoholics Anonymous)

**Live Feeds (TSML):**
- ✅ NYC Inter-Group (covers NY metro)
- ✅ AA San Francisco & Marin (covers CA coast)
- ❌ Other regions → Community submissions + official finder fallback

**Algorithm:**
1. Find user's location (lat/lng)
2. Identify nearest AA intergroup
3. Fetch that intergroup's TSML endpoint
4. Filter by radius
5. If no feed/no meetings → show community submissions + official link

**To Add More Intergroups:** See [AA_EXPANSION.md](./AA_EXPANSION.md)

### NA (Narcotics Anonymous)

**Live Feed (BMLT Worldwide):**
- ✅ Global directory updated by regional NA regions
- ✅ Works everywhere (no regional limitation)

**Endpoint:** `https://aggregator.bmltenabled.org/main_server/client_interface/json/?switcher=GetSearchResults&lat_val={lat}&long_val={lng}&geo_width={radius}`

### SMART Recovery, Refuge Recovery, Women for Sobriety, S.O.S., LifeRing, She Recovers, Celebrate Recovery

**No live feeds available.** Strategy:

1. **Community submissions** — Users add meetings
2. **Official finders** — Always available as fallback
   - SMART: https://meetings.smartrecovery.org
   - Refuge Recovery: https://www.refugerecovery.org
   - Women for Sobriety: https://womenforsobriety.org
   - S.O.S.: https://www.sossobriety.org
   - LifeRing: https://lifering.org
   - She Recovers: https://sherecovers.org
   - Celebrate Recovery: https://www.celebraterecovery.com

---

## 🔄 Community Submission Flow

1. **User sees "No meetings found"** in their area
2. **Clicks "Submit or update a meeting"**
3. **Fills form:**
   - Fellowship, meeting name, day/time, venue, address, online URL
   - What changed (new, correction, removal, temporary notice)
4. **Submits anonymously** (no email, no contact info)
5. **RLS forces `status='pending'`** (doesn't appear until approved)
6. **Moderator reviews** within 24 hours
7. **If approved:** `status='approved'` → Visible in app with ✓ badge

### Moderation Dashboard

**Access:** https://we-do-recover.vercel.app/moderation.html (read-only demo, full dashboard requires auth)

**Features:**
- View pending submissions
- Approve/reject one-by-one
- Filter by status (pending, approved, rejected)
- See stats (pending count, approved count, etc.)

---

## 🚀 Deployment

### Frontend & Serverless
**Vercel** (auto-deploys from GitHub)

```
my-repo/
├── index.html          (main app)
├── manifest.json       (PWA config)
├── api/
│   └── meetings.js     (serverless function)
├── package.json        ({"type": "module"})
└── moderation.html     (dashboard)
```

**Process:**
1. Push to `main` branch
2. GitHub webhook → Vercel
3. Vercel builds + deploys
4. Live at https://we-do-recover.vercel.app

### Database
**Supabase** (PostgreSQL)

**Project:** `qdxufynzilmqzhortyrq` (rALPHs org, us-east-1, free tier)

**Tables:**
- `submissions` — All submitted data, `status` field controls visibility
- `approved_meetings` — View of submissions where status='approved'

**RLS Policies:**
- Anon users can INSERT only `status='pending'`
- Anon users can SELECT only from `approved_meetings` view

---

## 📝 Making Changes

### Adding a Live AA Intergroup

1. **Verify TSML endpoint** (see [AA_EXPANSION.md](./AA_EXPANSION.md))
2. **Edit `api/meetings.js`:**
   ```javascript
   const AA_SOURCES = {
     // existing...
     denver: {
       name: "AA Denver",
       url: "https://www.aadenver.org/wp-admin/admin-ajax.php?action=meetings",
       homepage: "https://www.aadenver.org",
       center: { lat: 39.74, lng: -104.99 }
     }
   };
   ```
3. **Commit + push**
4. **Vercel auto-deploys**

### Changing the Theme

Edit `:root` CSS variables in `index.html` `<style>` block:

```css
:root {
  --blue: #1e3a8a;           /* Primary color */
  --amber: #f59e0b;          /* Accent */
  --paper: #f9fafb;          /* Background */
  --card: #ffffff;           /* Card bg */
  --ink: #1f2937;            /* Text */
  /* ... */
}
```

### Changing Text/Branding

- **Header title:** Search `<h1>We Do Recover</h1>` in index.html
- **Header subtitle:** Search `<p>All pathways welcome...</p>`
- **Manifest:** Update `name`, `short_name`, `description` in manifest.json

---

## 🔧 API Reference

### GET `/api/meetings`

**Query Parameters:**
- `fellowship` — AA, NA, SMART, RR, WFS, SOS, LR, SR, or CR (required)
- `lat` — Latitude (required)
- `lng` — Longitude (required)
- `radius` — Search radius in miles, default 25, max 100 (optional)

**Example:**
```
GET /api/meetings?fellowship=NA&lat=40.7128&lng=-74.0060&radius=50
```

**Response:**
```json
{
  "fellowship": "NA",
  "full_name": "Narcotics Anonymous",
  "official_finder": "https://www.na.org/meetingsearch",
  "has_live_feed": true,
  "radius_miles": 50,
  "fetched_at": "2026-07-09T...",
  "count": 23,
  "source": {
    "name": "BMLT worldwide directory",
    "homepage": "https://bmlt.app"
  },
  "meetings": [
    {
      "fellowship": "NA",
      "name": "Fresh Start Group",
      "day": 0,
      "time": "19:30",
      "venue": "Community Center",
      "address": "123 Main St, New York, NY",
      "city": "New York",
      "lat": 40.7580,
      "lng": -73.9855,
      "distance": 3.2,
      "formats": ["Beginner", "Newcomer"],
      "notes": "Wheelchair accessible",
      "online_url": "",
      "source": "BMLT worldwide directory",
      "source_url": "https://bmlt.app",
      "community": false
    },
    // ... more meetings
  ],
  "notices": [
    {
      "kind": "temporary",
      "meeting_name": "Morning Group",
      "details": "Meeting cancelled July 4th",
      "day": 4,
      "time": "07:00",
      "city": "New York",
      "expires_at": "2026-07-05T00:00:00Z"
    }
  ]
}
```

---

## 🛡️ Privacy & Security

- **No analytics** — No tracking pixels, no Google Analytics
- **No cookies** — App uses only geolocation (user-initiated)
- **RLS enforced** — Submissions hidden until approved
- **Anonymous submissions** — No email, no contact info stored
- **Passwordless moderation** — Moderators use Supabase dashboard login only

---

## 📋 Roadmap

**Phase 1 — Core (Current)**
- [x] Live AA + NA feeds
- [x] Community submission system
- [x] Moderation dashboard
- [x] 9 fellowship support
- [ ] Nomini geocoding for addresses (planned)

**Phase 2 — User Features**
- [ ] User profiles (save hometown, preferred fellowships)
- [ ] Sobriety counter (days/hours/minutes since date)
- [ ] Maps integration (embedded directions)
- [ ] Push notifications (meeting reminders)

**Phase 3 — Community**
- [ ] Chat (with auto-mod)
- [ ] Analytics dashboard (view counts, coverage gaps)
- [ ] Offline support (cache meetings locally)
- [ ] Profile follow (recovery anniversaries, privacy-respecting)

---

## 🤝 Contributing

### Adding a New Intergroup Feed
1. Verify TSML endpoint works in browser
2. Document in AA_EXPANSION.md
3. Add to AA_SOURCES in api/meetings.js
4. Test locally (Vercel serverless environment)
5. Push + deploy

### Improving the UI
1. Edit index.html (HTML/CSS/JS all in one file)
2. Test on mobile (use Chrome DevTools device emulation)
3. Commit + push

### Fixing Bugs
1. Describe the issue in a commit message
2. Push to main
3. Vercel auto-deploys

---

## 📞 Support

**Issue with the app?** Check:
1. **Location permission** — App needs to know where you are
2. **Internet connection** — Vercel + Supabase require internet
3. **Fellowship selection** — Some fellowships only have community submissions
4. **Official finder** — Every fellowship has a link to its official directory

**Found a bug?** Open an issue on GitHub: https://github.com/3ighty6/we-do-recover/issues

---

## 📜 License

This project is open-source and free to use, modify, and distribute. No attribution required.

---

**Made with ❤️ for recovery communities everywhere.**

All pathways welcome. You are not alone.

