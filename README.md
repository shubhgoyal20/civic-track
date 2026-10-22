# Civic Track

**Report Problems. Track Action. Build Better Wards.**

Civic Track is a hackathon prototype that lets citizens report civic problems (potholes, garbage, broken streetlights, water leakage, drainage, public infrastructure), merges related reports into one common issue, and gives authorities and the public a transparent view of what has been done, ward by ward.

> **Prototype notice:** all data is sample data (Ghaziabad area, sample wards). It runs entirely in the browser and uses `localStorage`. The authority login is a simulated role switch, not a government login.

## Features

- **Anonymous reporting**: no name, phone, ID or account. Random tracking IDs (e.g. `CT-7F3A92`), never sequential.
- **GPS capture**: browser Geolocation API, requested only after pressing *Detect My Location*; tap-to-adjust pin; locality fallback; a new GPS fix never silently replaces an adjusted pin.
- **Live on-the-spot capture only**: no gallery upload. The phone camera (getUserMedia) and GPS are used together; the photo is stamped with GPS accuracy and time. On a laptop the Report page shows a **QR code** to continue on a phone. Re-drawing on a canvas strips EXIF metadata.
- **AI-assisted demo verification**: transparent rule-based checks (labelled as a demo, no real model).
- **Complaint merging**: weighted match score (distance, category, description, image hash, time) leads to *link*, *manual review* or *new issue*. Original reports are never deleted; merges can be undone and reports separated.
- **Collective threshold**: configurable (default 25 verified reports) leads to "Threshold Reached" and a proposed 15-day action deadline, then Overdue/escalation.
- **Tracking page**: look up a report by tracking ID, with timeline, counts, deadline and resolution source.
- **Authority dashboard** (simulated role): KPIs, review queue, filters, assign, status, notes, ETA, work photos, resolve, escalate.
- **Public transparency dashboard**: ward comparison, department status, month trend, hotspots, work history, with definitions and no party attribution.

## Run locally

```bash
git clone <your-repo-url> civic-track && cd civic-track
node server.js            # shared-data mode (Node 18+), http://localhost:8080
# or static only:  python3 -m http.server 8080
```

GPS and camera work on `localhost` and on any **HTTPS** site, but not on plain `http://` (e.g. a LAN IP). To test on a phone, deploy (below) or use an HTTPS tunnel.

## Deploy

**A. Static hosting** (Netlify, Cloudflare Pages, Vercel, GitHub Pages): publish the repo root; there is no build step. HTTPS is automatic. GitHub Pages: enable *Settings > Pages > GitHub Actions*; `.github/workflows/pages.yml` deploys on push. Data stays in each browser, so a phone report will **not** appear on a laptop.

**B. Node server** (Render, Railway, Fly.io, any VPS): run `npm start`. Set `DATA_FILE` to a path on a persistent disk (free tiers often wipe the disk on restart). Phones and laptops now share the same issues and reports (state syncs every 20 s and on *Refresh*), which also makes the QR hand-off work end to end. No IP addresses are logged or stored.

**Settings** are in `config.js`: `demoData: false` starts with no sample issues; `publicUrl` sets the URL encoded in the phone QR code.

## GPS notes

- Location is requested only after the user taps *Near me* or *Open camera & GPS*. If the browser already granted permission, the map locates automatically. The user's position is kept in memory only and is never saved or sent.
- Report capture needs a GPS fix of 150 m or better; the app keeps refining the fix while the camera is open.
- Errors are explained (blocked permission, timeout, no HTTPS). Laptops usually give only coarse Wi-Fi/IP positions, which is why photos are taken on a phone.

## Project structure

```
index.html        entry page
config.js         deployment settings
server.js         optional Node server (static files + shared-state API)
netlify.toml, .github/workflows/pages.yml   hosting configs
src/styles.css    design tokens, layout, components (light/dark)
src/app.js        data model, seed data, matching, router, most pages
src/map.js        interactive maps (Leaflet/OSM + pan/zoom SVG fallback), status chips, fullscreen, locate
src/charts.js     donut + stacked volume charts
src/sync.js       optional shared state with the Node server (merge on conflict)
src/ui.js         dashboard shell, home, live-capture report flow, QR hand-off
tools/build_single.py  inline everything into one HTML file
docs/ARCHITECTURE.md
```

## Data model (summary)

`Report` (reportId, trackingId, issueId, category, description, originalLatitude/Longitude, locationAccuracy, submittedAt, imageReference, verificationStatus, duplicateMatchScore, reviewStatus), `Issue` (issueId, canonical fields, ward, department, severity, associatedReportIds, total/verified counts, status, threshold, deadline fields, evidenceReferences, activityTimeline) and `TimelineEntry` (eventId, issueId, eventType, timestamp, publicNote, actorRole). No identity fields exist anywhere.

## Limitations (read before going live)

- **Sample data:** set `demoData: false` for production.
- **No authentication:** the "authority" role is a UI switch that anyone can use. Do not use this for real government workflows without real login and role-based access.
- **GPS/camera spoofing:** live capture is enforced in the browser only; a determined user can fake it. Real verification needs server-side checks and review.
- **Shared state is simple:** one JSON file with last-writer-wins per issue (merge by latest activity). Fine for a demo; use a real database for production.
- **Spam control** is a per-browser rate limit and duplicate-image hash, not server-side enforcement.
- **Privacy:** photos are re-drawn (EXIF stripped) but faces and number plates are not blurred, and nothing here has had a privacy audit. Perfect anonymity is not claimed.
- AI verification is rule-based ("AI-assisted demo"). The 15-day deadline is a proposed workflow, not a legal requirement.

## Roadmap

1. Port to React + TypeScript + Tailwind.
2. Address search (geocoder).
3. Backend (API + database), real authentication and role-based access, separate private evidence storage.
4. Real image-similarity and classification models.
5. Server-side rate limiting and spam review.

## License

MIT, see `LICENSE`.
