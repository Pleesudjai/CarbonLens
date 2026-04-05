# CarbonLens Presentation Brief

This note is written for a teammate who needs to present the project clearly at the hackathon.

## Key Message

- Real climate impact in transportation has to start at the `community` level, not only at the individual level.
- This project focuses on `system-scale change` by helping cities choose better corridor designs, not just asking one person to change behavior.
- CarbonLens is about designing better public infrastructure so lower-carbon choices become easier for the whole community.

## 1. Public APIs and External Data Sources Used

### A. Live public data APIs used by the app

1. `ADOT traffic monitoring page`
   - Purpose: find the latest Arizona AADT workbook
   - URL:
     - `https://azdot.gov/planning/data-and-information/traffic-monitoring`

2. `ADOT Traffic Sections ArcGIS service`
   - Purpose: get roadway geometry and traffic-section alignment for Phoenix
   - URL:
     - `https://azgeo.az.gov/arcgis/rest/services/adot/TrafficSections/MapServer/1/query`

3. `U.S. Census TIGERweb Census 2020 block groups`
   - Purpose: get block-group centroids and population geography
   - URL:
     - `https://tigerweb.geo.census.gov/arcgis/rest/services/Census2020/Tracts_Blocks/MapServer/1/query`

4. `U.S. Census ACS 2023`
   - Purpose: get zero-vehicle household share
   - URL:
     - `https://api.census.gov/data/2023/acs/acs5`

5. `U.S. Census LEHD / LODES`
   - Purpose: get workplace jobs by block group
   - URLs:
     - directory listing:
       - `https://lehd.ces.census.gov/data/lodes/LODES8/az/wac/`
     - app selects the latest Arizona `az_wac_S000_JT00_YYYY.csv.gz`

6. `U.S. Census Bureau TIGERweb Transportation`
   - Purpose: road-network density, intersection proxy, ROW / urban-core / constructability proxy, and delay-emissions hotspot proxy
   - URL root:
     - `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation_LargeScale/MapServer`

7. `FEMA NFHL Flood Hazard Zones`
   - Purpose: live flood-risk enrichment for each corridor segment
   - URL:
     - `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query`

8. `CARTO basemap style`
   - Purpose: basemap tiles and style through MapLibre
   - URL:
     - `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`

### B. AI API used by the app

9. `Anthropic Claude API`
   - Purpose: explain results and adapt recommendation language for `Planner`, `Contractor`, and `Community`
   - Important:
     - Claude is used for explanation and advisory language
     - Claude is **not** used for the core carbon math

### C. Important note for the presentation

- The app does **not** use Google Maps API
- The core engineering scores come from deterministic backend calculations plus live public data enrichment
- GTFS-like transit context in the current build is derived from the Phoenix fixed-guideway network model already stored in the app, not a live GTFS API call on every request

### D. Internal app endpoints

These are the project's own backend endpoints:

1. `GET /api/background-overlays`
   - loads live map overlays like:
     - `Road CO2 Pressure`
     - `Mode-Shift Opportunity`
     - `Delay Emissions Hotspots`

2. `POST /api/analyze`
   - runs the deterministic corridor analysis

3. `POST /api/ai-corridor-advisor`
   - sends finished results to Claude for audience-specific explanation

## 2. How the App Workflow Works

### High-level workflow

1. The user creates one or more corridor options such as `Alt A`, `Alt B`, and `Alt C`.
2. The user draws each corridor directly on the map.
3. The app measures the corridor geometry from the actual line the user drew.
4. The app previews some live planning values directly from map data.
5. The user clicks `Analyze Corridors`.
6. The backend enriches each segment with live public context.
7. The deterministic engine calculates carbon, cost, duration, disruption, buildability, and community metrics.
8. The frontend compares the corridor options and shows a recommendation.
9. The recommendation changes depending on whether the user selects:
   - `Planner`
   - `Contractor`
   - `Community`
10. The user can open `Show Report` to see a clean presentation layout.

### Detailed backend flow

1. Frontend sends the scenario to `POST /api/analyze`.
2. Backend slices the corridor geometry into segment geometry.
3. Backend calls:
   - FEMA NFHL for flood context
   - TIGERweb Transportation for road-network constructability context
4. Deterministic analysis engine calculates:
   - `Material Carbon`
   - `During-Build Carbon`
   - `Total Carbon`
   - `Cost`
   - `Duration`
   - `Disruption`
   - `Buildability`
   - `Build Penalty Score`
   - `Maintenance Risk`
   - `Community Benefit`
   - per-mile normalized values
5. Frontend builds the recommendation from the selected audience lens.
6. Claude optionally rewrites the explanation in clearer human language.

### Carbon logic in simple words

- `Material Carbon`
  - concrete, steel, fiber, and structural material carbon

- `During-Build Carbon`
  - traffic delay, detours, and construction equipment emissions during construction

- `Total Carbon`
  - material carbon + during-build carbon

### Why this matters

Two routes can have similar length but very different total carbon because:

- material carbon mostly follows structure and length
- during-build carbon mostly follows traffic exposure, staged construction, and corridor difficulty

## 3. How to Use the Website

### Basic user steps

1. Open the website.
2. Click `+ Add` to create a corridor option.
3. Select that corridor.
4. Click `Draw Alt ...` to start drawing the route.
5. Click along the map to place points.
6. **Double-click to finish the route.**
7. Add more corridor options if you want alternatives.
8. Review the segment panel on the right.
9. Click `Analyze Corridors`.
10. Compare the results.

### What the user can do after analysis

- switch between:
  - `Planner`
  - `Contractor`
  - `Community`
- compare:
  - total carbon
  - carbon per mile
  - cost
  - cost per mile
  - duration
  - disruption
  - buildability
  - community benefit
- inspect:
  - `Structure Carbon Comparison`
  - `Section Tradeoffs`
  - live FEMA and TIGER enrichment
- open `Show Report` for a cleaner presentation view

### What the map overlays mean

1. `Road CO2 Pressure`
   - where roadway activity is likely creating high emissions pressure now

2. `Mode-Shift Opportunity`
   - where a new transit corridor could replace more car travel

3. `Delay Emissions Hotspots`
   - where traffic + network complexity likely increase stop-and-go emissions

### Important use note

Before analysis:

- some editor values are measured from drawing
- some are live previews from map data
- some remain default placeholders until analysis

After analysis:

- flood and constructability fields are enriched with live public data where available

## 4. Impact of the Project

### The main impact

This project helps planners compare transit corridor options with a carbon-first, engineering-aware workflow instead of relying only on rough intuition. Its bigger message is that transportation change should start with better community infrastructure, not only individual choices.

### Why it is valuable

1. `Faster early-stage planning`
   - teams can sketch options quickly and see tradeoffs immediately

2. `Transparent public-data foundation`
   - decisions are tied to real public datasets instead of hidden black-box assumptions

3. `Carbon-aware design decisions`
   - the app compares both:
     - embodied/material carbon
     - during-construction emissions

4. `Route comparison on equal footing`
   - per-mile metrics let teams compare corridors with different lengths fairly

5. `Better communication with different stakeholders`
   - `Planner`, `Contractor`, and `Community` views explain the same project differently

6. `Practical FRC vs RC decision support`
   - the app shows what happens if the corridor switches from conventional RC to FRC:
     - slab thickness change
     - steel demand change
     - material carbon impact
     - during-build carbon impact
     - total carbon effect on the chosen route

### One-sentence hackathon impact statement

`CarbonLens helps cities design lower-carbon transit corridors faster by combining live public data, deterministic engineering analysis, and audience-specific decision support in one map-based workflow, because real transportation change starts at the community level.`

### Short presentation takeaway

This is not just a map and not just a carbon calculator.

It is:

- a corridor planning tool
- a carbon comparison engine
- a public-data decision support system
- and a communication tool for planners, engineers, contractors, and communities

### Strong closing line for the presentation

`This project is important because lasting transportation change does not start with one person. It starts with community-level infrastructure decisions that shape how everyone travels.`
