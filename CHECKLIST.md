# We Do Recover — Action Checklist

## 🎯 Immediate Actions (This Week)

### 1. Test the App
- [ ] Open https://we-do-recover.vercel.app
- [ ] Allow location access when prompted
- [ ] Verify you see NA meetings in your area
- [ ] Try filtering by fellowship, day, time
- [ ] Click on a meeting → details open correctly
- [ ] Click Maps links → opens Google/Apple Maps
- [ ] Scroll through and confirm app responds smoothly
- [ ] Test on mobile device (not just desktop)
- [ ] Try installing as PWA (Add to homescreen)
- [ ] Confirm homescreen icon is blue

### 2. Test Community Submissions
- [ ] Click "Submit or update a meeting"
- [ ] Fill form with test meeting details
- [ ] Submit the form
- [ ] See "Thank you" confirmation
- [ ] Go to moderation dashboard: https://we-do-recover.vercel.app/moderation.html
- [ ] Find your pending submission
- [ ] Click ✓ Approve
- [ ] Go back to main app, refresh
- [ ] Confirm meeting now appears with ✓ badge

### 3. Test Moderation Flow
- [ ] Create 3 test submissions (new, change, remove)
- [ ] Approve 1, reject 1, leave 1 pending
- [ ] Confirm approved appears in app
- [ ] Confirm rejected doesn't appear
- [ ] Confirm pending doesn't appear

### 4. Test Error States
- [ ] Deny location permission → see fallback text + official finder link
- [ ] Disable internet (dev tools) → see error message
- [ ] Search fellowship with no meetings in your area → see "No meetings found" + link to official finder
- [ ] Try extreme radius (1 mile, then 100 miles) → both work

---

## 🔍 Research Phase (Weeks 1-2)

### 5. Research More AA Intergroups
Pick 5 major metro areas:
- [ ] **Chicago** — Find AA intergroup website
- [ ] **Los Angeles** — Find AA intergroup website
- [ ] **DC Area** — Find AA intergroup website
- [ ] **Boston** — Find AA intergroup website
- [ ] **Atlanta** — Find AA intergroup website

For each:
- [ ] Go to their website
- [ ] Find TSML endpoint (URL ending in `?action=meetings`)
- [ ] Test it in browser (copy/paste the URL, should return JSON)
- [ ] Count meetings returned (should be >0)
- [ ] If works: Document in `AA_EXPANSION.md`
- [ ] If doesn't work: Try alternate URL patterns

### 6. Verify TSML URLs
Test each URL in browser address bar:
```
https://www.[intergroup-domain]/wp-admin/admin-ajax.php?action=meetings
```

Should return: JSON array with meeting objects containing:
- `name` (meeting name)
- `day` (0-6)
- `time` (HH:MM)
- `latitude`, `longitude`
- `location` (venue)

If you see this → URL works, add to AA_EXPANSION.md

---

## 🚀 Expansion Phase (Weeks 2-3)

### 7. Add Verified Intergroups
For each verified TSML endpoint:
1. [ ] Edit `api/meetings.js`
2. [ ] Add entry to `AA_SOURCES` object
3. [ ] Include name, URL, homepage, center coordinates
4. [ ] Commit with clear message: "Add AA [City] intergroup"
5. [ ] Push to main
6. [ ] Vercel auto-deploys
7. [ ] Test from that city location in app
8. [ ] Confirm meetings appear

### 8. Update Documentation
- [ ] Update `AA_EXPANSION.md` with verification results
- [ ] Mark "Research" → "Verified" or "Failed"
- [ ] Document any issues or quirks found
- [ ] Commit + push

---

## 🛡️ Quality Assurance

### 9. Test Each Fellowship
- [ ] AA — Show live meetings (or community fallback)
- [ ] NA — Show live meetings (BMLT worldwide)
- [ ] SMART — Show community submissions, link to official finder
- [ ] Refuge — Show community submissions, link to official finder
- [ ] WFS — Show community submissions, link to official finder
- [ ] SOS — Show community submissions, link to official finder
- [ ] LifeRing — Show community submissions, link to official finder
- [ ] She Recovers — Show community submissions, link to official finder
- [ ] Celebrate — Show community submissions, link to official finder

### 10. Performance & Accessibility
- [ ] App loads in <2 seconds on slow 3G
- [ ] All buttons keyboard-accessible (Tab key)
- [ ] Screen reader can navigate (test with VoiceOver/TalkBack)
- [ ] Colors have sufficient contrast
- [ ] Mobile viewport works at various sizes
- [ ] No console errors in DevTools

---

## 📊 Launch Readiness

### 11. Pre-Launch Checklist
- [ ] Tested from 3+ different locations
- [ ] Tested on iPhone and Android
- [ ] All 9 fellowships work (or link to official finders)
- [ ] Submission + moderation flow works end-to-end
- [ ] README is up-to-date
- [ ] No broken links
- [ ] No console errors
- [ ] GitHub repo has all code

### 12. Share & Gather Feedback
- [ ] Share app with 5-10 trusted people
- [ ] Ask: "Can you find a meeting in your area?"
- [ ] Ask: "Is the submission process clear?"
- [ ] Ask: "Would you use this regularly?"
- [ ] Collect feedback, note issues
- [ ] Fix bugs as reported

---

## 🎯 Success Criteria

**The app is ready when:**
1. ✅ Users can find meetings (live data + community submissions)
2. ✅ Users can submit new meetings (anonymous, reviewed in 24hr)
3. ✅ Moderators can approve/reject submissions
4. ✅ All 9 fellowships are supported
5. ✅ Official finders linked for fallback
6. ✅ App works on mobile + desktop
7. ✅ Zero tracking, no analytics
8. ✅ No crashes or errors

---

## 📞 If You Get Stuck

**Problem: App doesn't load**
- Check internet connection
- Try https://we-do-recover.vercel.app in different browser
- Check browser console (F12 → Console tab)
- Report issue on GitHub

**Problem: No meetings show**
- Confirm you allowed location permission
- Try different fellowship (NA should work everywhere)
- Try larger radius (50+ miles)
- Check that your location is correct

**Problem: TSML URL doesn't work**
- Try in private/incognito window
- Try different device (TSML sometimes blocks certain IPs)
- Try removing trailing slash
- Try just `/wp-admin/admin-ajax.php?action=meetings` without domain first

**Problem: Submission doesn't appear**
- Check moderation dashboard
- Confirm status changed from pending → approved
- Try refresh app + clear cache (Ctrl+Shift+Delete)
- Wait 1-2 minutes for cache to flush

---

## 🎉 After Launch

Once live with real users:
1. Monitor for errors (check Vercel dashboard)
2. Review submissions regularly (24hr goal)
3. Track which fellowships get most searches
4. Add more AA intergroups as researched
5. Celebrate every approved community submission!

---

**You've got this! 💪**

Questions? Check README.md or open an issue on GitHub.
