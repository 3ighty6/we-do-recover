# AA Coverage Expansion Plan

## Current Status (Live)
✅ **NYC Inter-Group** — Verified working TSML feed (40.71°N, 74.01°W)
✅ **SF/Marin** — Verified working TSML feed (37.77°N, 122.42°W)
❌ All other regions — Community submissions + official finder fallback

## Strategy: Hybrid = Live Feeds + Community + Official Finder

### Why This Works
1. **Live feeds exist only for ~15 AA intergroups nationwide** (not all 50 states)
2. **Community submissions are more scalable** than maintaining 50+ feed URLs
3. **Official AA.org finder already covers everything** — we're filling gaps intelligently
4. **Users can update meetings** for accuracy in near-real-time

---

## Expansion: Adding More AA TSML Feeds

To add a new AA intergroup:

1. **Find the intergroup website** (e.g., aachicago.org)
2. **Verify TSML endpoint exists:**
   ```
   https://[intergroup-domain]/wp-admin/admin-ajax.php?action=meetings
   ```
3. **Test from browser** (curl/Node fails; TSML blocks CLI):
   ```
   https://www.aachicago.org/wp-admin/admin-ajax.php?action=meetings
   ```
4. **If valid JSON + meetings returned:**
   - Add to `AA_SOURCES` in `api/meetings.js`
   - Commit + deploy

### Intergroups to Add (High Priority - Major Metro Areas)

| Region | Approx Center | Status |
|--------|---------------|--------|
| Los Angeles | 34.05°N, 118.24°W | Research |
| Chicago | 41.88°N, 87.63°W | Research |
| DC Area | 38.91°N, 77.04°W | Research |
| Boston | 42.36°N, 71.06°W | Research |
| Philadelphia | 39.95°N, 75.17°W | Research |
| Denver | 39.74°N, 104.99°W | Research |
| Seattle | 47.61°N, 122.33°W | Research |
| Portland | 45.52°N, 122.68°W | Research |
| Minneapolis | 44.98°N, 93.26°W | Research |
| Austin | 30.27°N, 97.74°W | Research |
| Miami | 25.76°N, 80.19°W | Research |
| Atlanta | 33.75°N, 84.39°W | Research |
| Houston | 29.76°N, 95.37°W | Research |
| Phoenix | 33.45°N, 112.07°W | Research |
| Las Vegas | 36.17°N, 115.14°W | Research |

---

## Community Submission Strategy

### For Users Outside Coverage Areas
1. **"No meetings found"** → Click **"Submit or update a meeting"**
2. **User submits meeting details**
3. **Supabase RLS:** Inserts as `status='pending'`
4. **Moderation dashboard:** Approve/reject within 24 hours
5. **Approved meetings:** Visible in app with "✓ Community" badge

### For Users in Coverage Areas
1. **Live TSML meetings shown**
2. **Community submissions layered in**
3. **Both visible → full picture**

---

## Manual AA Feed Verification Process

To verify a new AA intergroup TSML feed:

1. **Find the intergroup URL** (Google: "[city] AA intergroup TSML")
2. **Try the endpoint in browser:**
   ```
   https://www.[intergroup].org/wp-admin/admin-ajax.php?action=meetings
   ```
3. **Expected response:** JSON array with meeting objects
4. **If valid JSON + has >0 meetings:**
   - Add to `AA_SOURCES` in `api/meetings.js`
   - Update center coordinates
   - Commit + deploy

