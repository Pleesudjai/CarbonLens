# GitHub Repo Research

Last checked: 2026-04-04

This folder stores the GitHub repo research pool for the Innovation Hacks 2.0 Amazon Sustainability track.

The research was guided by the themes in `CLAUDE.md`:
- reduce waste
- lower carbon footprint
- make sustainable purchasing decisions
- measure environmental impact
- align with e-commerce, supply chain, packaging, delivery logistics, or consumer purchasing

## Files

- `repo_pool.md`: detailed repo cards, fit analysis, reuse ideas, and cautions

## Fast Shortlist

These are the strongest repos to mine first if we want something practical for a weekend build.

| Priority | Repo | Main fit | Why it stands out |
| --- | --- | --- | --- |
| 1 | [openfoodfacts/smooth-app](https://github.com/openfoodfacts/smooth-app) | Sustainable purchasing | Best real-world product scanning and decision UX |
| 2 | [openfoodfacts/openfoodfacts-server](https://github.com/openfoodfacts/openfoodfacts-server) | Product data and API | Best backend/data foundation for eco-aware shopping |
| 3 | [NMF-earth/nmf-app](https://github.com/NMF-earth/nmf-app) | Carbon footprint | Strong example of mobile carbon tracking tied to product data |
| 4 | [SpandanChetia/FeedForward](https://github.com/SpandanChetia/FeedForward) | Waste reduction | Good hackathon-style app with waste, CO2, donation, and inventory in one place |
| 5 | [fleetbase/fleetbase](https://github.com/fleetbase/fleetbase) | Supply chain and logistics | Strongest Amazon-aligned logistics architecture reference |
| 6 | [googlemaps/js-route-optimization-app](https://github.com/googlemaps/js-route-optimization-app) | Delivery emissions | Best route optimization demo for lower-carbon delivery ideas |
| 7 | [coopcycle/coopcycle-web](https://github.com/coopcycle/coopcycle-web) | Sustainable last mile | Good reference for greener local delivery workflows |
| 8 | [fairdirect/foodrescue-app](https://github.com/fairdirect/foodrescue-app) | Reduce food waste | Strong "use what you already bought" angle instead of another calculator |

## Best Repo Combos

### 1. Sustainable shopping assistant

- `smooth-app` for scan-and-decide user flow
- `openfoodfacts-server` for product data and API concepts
- `nmf-app` for carbon-footprint framing

### 2. Food waste and donation platform

- `FeedForward` for dashboard and inventory concepts
- `foodrescue-app` for barcode/category rescue logic
- `fleetbase` or `coopcycle-web` for pickup and delivery flow ideas

### 3. Lower-carbon delivery optimizer

- `fleetbase` for logistics platform patterns
- `js-route-optimization-app` for route planning logic
- `coopcycle-web` for bike/local delivery inspiration

### 4. Credible impact measurement layer

- `olca-app` for rigorous LCA framing
- `activity-browser` for Brightway-based exploration
- `bw_timex` or `swolfpy` for advanced impact modeling

## Practical Recommendation

If we want the best balance of judge appeal and buildability, start with one of these:

1. A barcode-based sustainable shopping assistant
2. A food waste reduction plus donation routing app
3. A low-carbon local delivery planner for small merchants
