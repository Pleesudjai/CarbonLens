# GitHub Repo Pool

Last checked: 2026-04-04

This file is a reusable research pool, not just a shortlist. Each repo card includes:
- what it is
- why it fits the hackathon
- what we can borrow fast
- what might be risky for a weekend MVP

## Tier 1: Strongest Fits

## openfoodfacts/smooth-app

- Link: https://github.com/openfoodfacts/smooth-app
- Track fit: sustainable purchasing, consumer decision support, barcode scanning
- Snapshot: about 1.3k stars, 442 forks, 57 releases, latest release Jan 6, 2026, Apache-2.0, mostly Dart
- What it does: the current Open Food Facts mobile app for Android and iPhone, built with Flutter and Dart
- Why it matters: this is the best reference for a real scan -> product lookup -> user decision flow
- Useful ideas to reuse:
  - barcode-first onboarding
  - product comparison UX
  - eco-aware shopping flows built on product metadata
  - cross-platform mobile patterns
- Best use for us: build a lighter MVP that recommends greener alternatives or flags lower-impact products
- Watchouts:
  - full app scope is much too large for a weekend
  - best used as UX/API inspiration, not as something to fully fork and ship

## openfoodfacts/openfoodfacts-server

- Link: https://github.com/openfoodfacts/openfoodfacts-server
- Track fit: sustainable purchasing, recycling, product data, environmental impact inputs
- Snapshot: about 979 stars, 601 forks, 121 releases, latest release Mar 31, 2026, AGPL-3.0, mostly HTML and Perl
- What it does: Open Food Facts database, API server, and web interface
- Why it matters: this is the strongest open data and API foundation for any consumer-facing sustainability shopping app
- Useful ideas to reuse:
  - product schema ideas
  - API integration patterns
  - nutrition, recycling, allergen, and environment-related product fields
  - evidence-backed product lookup
- Best use for us: power a recommendation engine that suggests more sustainable products or better packaging choices
- Watchouts:
  - server stack is older and more complex than a hackathon team usually wants to adopt whole
  - licensing matters if we ever move beyond a demo

## NMF-earth/nmf-app

- Link: https://github.com/NMF-earth/nmf-app
- Track fit: carbon footprint reduction, personal impact measurement, sustainable shopping tie-in
- Snapshot: 534 stars, 163 forks, GPL-3.0, mostly TypeScript, React Native / Expo
- What it does: mobile app focused on understanding and reducing personal carbon footprint
- Why it matters: it is one of the clearest examples that combines climate framing with mobile usability, and its topics include Open Food Facts and zero waste
- Useful ideas to reuse:
  - carbon-footprint dashboard patterns
  - goal-setting and behavior-change framing
  - mobile app structure for climate-oriented recommendations
- Best use for us: borrow the behavior-change framing while replacing generic tracking with shopping or delivery actions
- Watchouts:
  - broad personal-footprint apps can become generic fast
  - we should connect any copycat idea to purchases, logistics, or waste so it feels less generic to judges

## SpandanChetia/FeedForward

- Link: https://github.com/SpandanChetia/FeedForward
- Track fit: food waste reduction, donation, carbon impact measurement, inventory
- Snapshot: 17 stars, 5 forks, 56 commits, no releases, mostly JavaScript/CSS/HTML
- What it does: food waste management web app with monthly waste stats, costs, quantity purchased, CO2 emissions, donations, inventory, recipes, and nutrition analysis
- Why it matters: this is a very hackathon-friendly reference because it already bundles several useful sustainability features in one app
- Useful ideas to reuse:
  - waste dashboard concepts
  - donation workflows with map integration
  - personal inventory and expiration tracking
  - CO2 summary cards
- Best use for us: ideal baseline inspiration for a "waste less, donate more" MVP
- Watchouts:
  - concept breadth is larger than its apparent implementation maturity
  - likely better to copy the feature mix than the exact codebase

## fairdirect/foodrescue-app

- Link: https://github.com/fairdirect/foodrescue-app
- Track fit: waste reduction, sustainable purchasing after purchase, barcode rescue guidance
- Snapshot: 12 stars, 6 forks, 166 commits, MIT, mostly QML/C++/XSLT/CMake
- What it does: cross-platform app that helps users decide if food is still edible by scanning a barcode or searching a category
- Why it matters: this is a stronger angle than a plain carbon calculator because it helps prevent waste from food already in the home
- Useful ideas to reuse:
  - barcode/category lookup flow
  - offline SQLite data approach
  - multilingual and low-connectivity support
  - "rescue before discard" framing
- Best use for us: build a simple food rescue assistant that suggests donation, recipe, or use-soon actions
- Watchouts:
  - niche stack compared with typical web/mobile hackathon stacks
  - better as product inspiration than direct stack reuse unless the team likes Qt

## Tier 2: Amazon-Aligned Logistics and Delivery

## fleetbase/fleetbase

- Link: https://github.com/fleetbase/fleetbase
- Track fit: supply chain, logistics, fulfillment, delivery operations
- Snapshot: about 1.8k stars, 607 forks, 1,148 commits, mostly JavaScript/PHP/Handlebars, mixed open/commercial licensing context
- What it does: modular logistics and supply chain operating system
- Why it matters: this is the strongest repo in the pool if the team wants a solution that feels clearly aligned with Amazon operations, routing, fleets, or merchant fulfillment
- Useful ideas to reuse:
  - logistics data models
  - order and shipment workflows
  - operational dashboards
  - modular architecture for dispatch and fulfillment
- Best use for us: reference architecture for a low-carbon delivery planner, merchant ops console, or greener fulfillment workflow
- Watchouts:
  - very large scope
  - likely too big to adopt directly during a weekend
  - use it as a systems reference, not a full project base

## googlemaps/js-route-optimization-app

- Link: https://github.com/googlemaps/js-route-optimization-app
- Track fit: lower delivery emissions, route optimization, logistics
- Snapshot: 136 stars, 52 forks, 14 releases, latest release Jun 6, 2025, Apache-2.0
- What it does: web app that explores Google Maps Platform Route Optimization for vehicle routing problems
- Why it matters: if our concept involves delivery emissions, route optimization is one of the clearest practical levers with obvious business value
- Useful ideas to reuse:
  - routing scenario modeling
  - shipment and vehicle constraints
  - map-based route visualization
  - logistics UI patterns
- Best use for us: prototype a merchant or driver planner that prefers low-emission routes, grouped deliveries, or bike-first local fulfillment
- Watchouts:
  - the repo explicitly says it is not meant for production critical paths
  - using it can generate Google Cloud and Maps billing charges
  - very strong for demo logic, less ideal as a dependency-heavy product base

## coopcycle/coopcycle-web

- Link: https://github.com/coopcycle/coopcycle-web
- Track fit: sustainable last-mile delivery, local commerce, bike logistics
- Snapshot: 590 stars, 136 forks, 562 releases, latest release Mar 15, 2026, mostly PHP/JavaScript/Gherkin/Twig/TypeScript
- What it does: logistics and marketplace platform for worker-owned delivery businesses
- Why it matters: it is a concrete example of greener local delivery instead of generic sustainability messaging
- Useful ideas to reuse:
  - local delivery marketplace flows
  - courier dispatch concepts
  - bike-courier framing
  - merchant ordering and fulfillment patterns
- Best use for us: inspiration for an eco-friendly local delivery or campus pickup-routing concept
- Watchouts:
  - big Symfony platform, too large for a weekend fork
  - social co-op framing may be less relevant than the delivery mechanics themselves

## Tier 3: Environmental Impact Measurement

## GreenDelta/olca-app

- Link: https://github.com/GreenDelta/olca-app
- Track fit: environmental impact measurement, defensible impact claims, life cycle assessment
- Snapshot: 251 stars, 60 forks, 25 tags, MPL-2.0, mostly Java
- What it does: source code of openLCA, a major life cycle assessment application
- Why it matters: if we need more credible environmental accounting than a hand-wavy estimate, this is one of the strongest open references in the pool
- Useful ideas to reuse:
  - LCA terminology and framing
  - impact categories and workflow concepts
  - a more rigorous way to talk about product/process impact
- Best use for us: methodology reference for how to justify our impact metric, not as a codebase to absorb fully
- Watchouts:
  - heavy Java/Eclipse/Maven stack
  - too much infrastructure for a weekend unless a teammate already knows openLCA

## LCA-ActivityBrowser/activity-browser

- Link: https://github.com/LCA-ActivityBrowser/activity-browser
- Track fit: environmental impact measurement, LCA exploration
- Snapshot: 201 stars, 67 forks, 42 releases, latest release May 15, 2025, LGPL-3.0, mostly JavaScript/Python
- What it does: GUI for Brightway2
- Why it matters: this is a more accessible bridge into Brightway-style LCA workflows than building raw LCA code from scratch
- Useful ideas to reuse:
  - how users inspect impact models
  - Brightway-based workflow references
  - impact-exploration UI concepts
- Best use for us: support repo for understanding how impact exploration can be surfaced to users or judges
- Watchouts:
  - useful mainly if we want methodological depth
  - not the best starting point for a consumer app MVP

## SwolfPy-Project/swolfpy

- Link: https://github.com/SwolfPy-Project/swolfpy
- Track fit: waste systems, waste optimization, impact modeling
- Snapshot: 25 stars, 11 forks, latest release Mar 3, 2024, GPL-2.0, almost entirely Python
- What it does: solid waste management LCA optimization framework with parametric and Monte Carlo analysis
- Why it matters: it is unusually on-theme for waste optimization and can support more serious impact modeling for municipal or systems-level waste concepts
- Useful ideas to reuse:
  - waste-system optimization framing
  - uncertainty and sensitivity analysis concepts
  - deeper waste impact modeling language
- Best use for us: background research if our concept becomes a municipal or campus waste-routing optimizer
- Watchouts:
  - fairly research-heavy
  - probably too deep for a weekend MVP unless we only borrow methodology language

## Bonus Repos Worth Mining

## magg01/smart-pantry

- Link: https://github.com/magg01/smart-pantry
- Track fit: reduce waste, household behavior change, IoT
- Snapshot: 0 stars, 76 commits, MIT, C++ only
- What it does: smart pantry system using ESP8266 nodes to monitor storage conditions, track expiry, and record waste
- Why it matters: gives us a concrete sensor-based angle if we want "prevent spoilage before it happens"
- Useful ideas to reuse:
  - expiry tracking
  - storage-condition monitoring
  - waste logging
- Watchouts:
  - hardware-heavy for a weekend unless we fake the sensors
  - lower maturity and visibility than the stronger repos above

## Rudra1402/HungerHalt

- Link: https://github.com/Rudra1402/HungerHalt
- Track fit: reduce waste, food redistribution, hackathon-style AI
- Snapshot: 1 star, 0 forks, mostly JavaScript with a small Python component
- What it does: MERN food waste management and surplus food redistribution platform with linear regression for waste prediction
- Why it matters: simple example of pairing redistribution with lightweight prediction
- Useful ideas to reuse:
  - donation/redistribution framing
  - MERN implementation ideas
  - "predict likely waste" pitch language
- Watchouts:
  - low maturity
  - AI component may be more pitch than production-grade

## democratize-technology/node-red-contrib-open-food-facts

- Link: https://github.com/democratize-technology/node-red-contrib-open-food-facts
- Track fit: sustainable purchasing, fast integration, product data access
- Snapshot: 3 stars, 6 releases, latest release Sep 16, 2025, MIT, mostly JavaScript
- What it does: Node-RED nodes for the Open Food Facts API, including product lookup, search, taxonomy access, uploads, and Robotoff insights
- Why it matters: fastest low-code path in the pool for connecting Open Food Facts data to automation or prototype workflows
- Useful ideas to reuse:
  - quick API wiring
  - supermarket or pantry automations
  - prototype data pipelines without building a full backend
- Watchouts:
  - best for Node-RED workflows, not ideal if our stack is a standard web app

## brightway-lca/bw_timex

- Link: https://github.com/brightway-lca/bw_timex
- Track fit: impact measurement, time-aware LCA, future-facing sustainability modeling
- Snapshot: 44 stars, 6 forks, 26 releases, latest release Mar 26, 2026, BSD-3-Clause, mostly Jupyter Notebook and Python
- What it does: time-explicit life cycle assessment on top of the Brightway framework
- Why it matters: good repo if we want stronger claims about how supply chains or technologies change over time
- Useful ideas to reuse:
  - time-aware impact framing
  - dynamic supply-chain assumptions
  - future-state scenario modeling
- Watchouts:
  - advanced and research-oriented
  - not a practical MVP frontend/backend starting point

## Quick Build Guidance

If we want a buildable weekend app, the best repo combinations are:

### Sustainable shopping assistant

- `openfoodfacts/smooth-app`
- `openfoodfacts/openfoodfacts-server`
- `NMF-earth/nmf-app`

Why this combo works:
- clear consumer value
- easy demo story
- strong Amazon-adjacent shopping relevance
- easy to frame measurable impact per purchase or per month

### Waste reduction plus donation routing

- `SpandanChetia/FeedForward`
- `fairdirect/foodrescue-app`
- `fleetbase/fleetbase` or `coopcycle/coopcycle-web`

Why this combo works:
- directly reduces waste
- easy to show community impact
- makes logistics part of the story instead of just a carbon score

### Lower-carbon merchant delivery planner

- `fleetbase/fleetbase`
- `googlemaps/js-route-optimization-app`
- `coopcycle/coopcycle-web`

Why this combo works:
- feels very Amazon-relevant
- strong business value
- quantifiable route and emissions savings

## Bottom Line

If forced to choose only three repos to study first, choose:

1. `openfoodfacts/smooth-app`
2. `openfoodfacts/openfoodfacts-server`
3. `fleetbase/fleetbase`

If forced to choose the most hackathon-friendly product direction, choose:

1. sustainable shopping assistant
2. food waste plus donation app
