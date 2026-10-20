# Civic Track

**Report Problems. Track Action. Build Better Wards.**

Civic Track is a hackathon prototype that lets citizens report civic problems (potholes, garbage, broken streetlights, water leakage, drainage, public infrastructure), merges related reports into one common issue, and gives authorities and the public a transparent view of what has been done, ward by ward.

> **Prototype notice:** all data is sample data (Ghaziabad area, sample wards). It runs entirely in the browser and uses `localStorage`. The authority login is a simulated role switch, not a government login.

## Features

- **Anonymous reporting**: no name, phone, ID or account. Random tracking IDs (e.g. `CT-7F3A92`), never sequential.
- **GPS capture**: browser Geolocation API, requested only after pressing *Detect My Location*; tap-to-adjust pin; locality fallback; a new GPS fix never silently replaces an adjusted pin.
- **Photo evidence**: upload or camera; re-drawn on a canvas, which strips EXIF/GPS metadata.
- **AI-assisted demo verification**: transparent rule-based checks (labelled as a demo, no real model).
- **Complaint merging**: weighted match score (distance, category, description, image hash, time) leads to *link*, *manual review* or *new issue*. Original reports are never deleted; merges can be undone and reports separated.
- **Collective threshold**: configurable (default 25 verified reports) leads to "Threshold Reached" and a proposed 15-day action deadline, then Overdue/escalation.
- **Tracking page**: look up a report by tracking ID, with timeline, counts, deadline and resolution source.
- **Authority dashboard** (simulated role): KPIs, review queue, filters, assign, status, notes, ETA, work photos, resolve, escalate.
- **Public transparency dashboard**: ward comparison, department status, month trend, hotspots, work history, with definitions and no party attribution.

## Run locally

No build step needed.

```bash
git clone <your-repo-url> civic-track
cd civic-track
python3 -m http.server 8080      # or: npx serve .
# open http://localhost:8080
```

Geolocation needs `localhost` or HTTPS. Use *Reset demo data* on the Privacy page to restore the seed data.

## Project structure

```
index.html        entry page
src/styles.css    design tokens, layout, components (light/dark)
src/app.js        data model, seed data, matching, router, pages
docs/ARCHITECTURE.md
```

## Data model (summary)

`Report` (reportId, trackingId, issueId, category, description, originalLatitude/Longitude, locationAccuracy, submittedAt, imageReference, verificationStatus, duplicateMatchScore, reviewStatus), `Issue` (issueId, canonical fields, ward, department, severity, associatedReportIds, total/verified counts, status, threshold, deadline fields, evidenceReferences, activityTimeline) and `TimelineEntry` (eventId, issueId, eventType, timestamp, publicNote, actorRole). No identity fields exist anywhere.

## What is simulated / limitations

- AI verification is rule-based; only a tiny 8x8 image hash is used for duplicate checks.
- The map is a schematic SVG (sample coordinates). No geocoding.
- Face and number-plate blurring is not implemented.
- Persistence, "authority" access and privacy controls are browser-side demos, not a substitute for server-side access control, secure storage and a privacy review. Perfect anonymity is not claimed.
- The 15-day deadline is a proposed Civic Track workflow, not a legal requirement.

## Roadmap

1. Port to React + TypeScript + Tailwind.
2. Leaflet + OpenStreetMap tiles and a geocoder.
3. Backend (API + database), real authentication and role-based access, separate private evidence storage.
4. Real image-similarity and classification models.
5. Server-side rate limiting and spam review.

## License

MIT, see `LICENSE`.
