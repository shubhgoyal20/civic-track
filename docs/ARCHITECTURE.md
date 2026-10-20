# Architecture

Single-page app, vanilla JS, hash routing (`#/home`, `#/report`, `#/map`, `#/track?id=`, `#/public`, `#/authority`, `#/issue/<id>`, `#/privacy`).

- **State**: `S` (issues, reports, reviews, cfg) persisted to `localStorage` key `civictrack_v1`; `UI` holds view state; `R` holds the report form.
- **Rendering**: `render()` rebuilds the DOM from page functions (`P.home`, `P.report`, ...). Events are delegated via `data-a` (actions), `data-f` (filters), `data-r` (report fields), `data-cfg` (settings).
- **Matching** (`match`): score = weighted mean of distance (100 m falloff), category, token-overlap text similarity, image-hash similarity (when both exist) and recency. Weights in `S.cfg.w`; thresholds `S.cfg.hi` (link) and `S.cfg.lo` (review). Candidates are limited to `S.cfg.cand` metres.
- **Status**: `eff(i)` derives "Overdue / Escalated" from the deadline when no action is recorded; `grp(i)` maps statuses to Pending / In Progress / Overdue / Resolved for dashboards and map colours.
- **Privacy**: public views use rounded coordinates and no complainant data exists in the model.
