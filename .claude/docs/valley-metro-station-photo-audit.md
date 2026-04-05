# Valley Metro Station Photo Audit

> **Purpose**: Reference note for the current Phoenix existing-network station photo catalog used in `GreenRoute Transit`.
> **When to use**: When verifying popup images, extending the station photo catalog, or checking which current Valley Metro stations still need exact image research.
> **Source**: Official Valley Metro GTFS station list plus a manual exact-photo verification pass using station-specific public pages on 2026-04-04.
> **Rule**: Exact verified station photos only. No generic route photos. No Google API fallback.

---

## Summary

- Phoenix existing-network layer currently contains `67` stations/stops
- Current verified exact-photo catalog contains `32` entries
- Remaining unmatched stations/stops: `36`

Important:

- `verified` means the app has a station-specific image entry we judged acceptable for that exact station
- `missing` means `not yet verified`, not `photo does not exist anywhere`

## Verified Exact-Photo Stations

- `19th Ave/Camelback`
  - Source: https://en.wikipedia.org/wiki/19th%20Avenue/Camelback%20station
- `19th Ave/Dunlap`
  - Source: https://en.wikipedia.org/wiki/19th%20Avenue/Dunlap%20station
- `24th St Station`
  - Source: https://commons.wikimedia.org/wiki/Category:PHX_Sky_Train
- `38th St/Washington`
  - Source: https://en.wikipedia.org/wiki/38th%20Street/Washington%20station
- `44th St Station`
  - Source: https://commons.wikimedia.org/wiki/Category:44th_Street/Washington_station
- `44th St/Washington`
  - Source: https://en.wikipedia.org/wiki/44th%20Street/Washington%20station
- `7th Ave/Camelback`
  - Source: https://en.wikipedia.org/wiki/7th%20Avenue/Camelback%20station
- `Alma School/Main St`
  - Source: https://en.wikipedia.org/wiki/Alma%20School/Main%20Street%20station
- `Campbell/Central Ave`
  - Source: https://en.wikipedia.org/wiki/Campbell/Central%20Avenue%20station
- `Center Pkwy/Washington`
  - Source: https://en.wikipedia.org/wiki/Center%20Parkway/Washington%20station
- `Center/Main St`
  - Source: https://en.wikipedia.org/wiki/Center/Main%20Street%20station
- `Central Ave/Camelback`
  - Source: https://en.wikipedia.org/wiki/Central%20Avenue/Camelback%20station
- `Country Club/Main St`
  - Source: https://en.wikipedia.org/wiki/Country%20Club/Main%20Street%20station
- `Encanto/Central Ave`
  - Source: https://en.wikipedia.org/wiki/Encanto/Central%20Avenue%20station
- `Glendale/19th Ave`
  - Source: https://en.wikipedia.org/wiki/Glendale/19th%20Avenue%20station
- `Indian School/Central Ave`
  - Source: https://en.wikipedia.org/wiki/Indian%20School/Central%20Avenue%20station
- `McDowell/Central Ave`
  - Source: https://en.wikipedia.org/wiki/McDowell/Central%20Avenue%20station
- `Mesa Dr/Main St`
  - Source: https://en.wikipedia.org/wiki/Mesa%20Drive/Main%20Street%20station
- `Mill Ave/3rd St`
  - Source: https://en.wikipedia.org/wiki/Mill%20Avenue/3rd%20Street%20station
- `Montebello/19th Ave`
  - Source: https://en.wikipedia.org/wiki/Montebello/19th%20Avenue%20station
- `Ninth St/Mill`
  - Source: https://commons.wikimedia.org/wiki/File:9th_%26_Mill_Station_-_Tempe_Streetcar.jpg
- `Northern/19th Ave`
  - Source: https://en.wikipedia.org/wiki/Northern%2F19th%20Avenue%20station
- `Osborn/Central Ave`
  - Source: https://en.wikipedia.org/wiki/Osborn/Central%20Avenue%20station
- `Priest Dr/Washington St`
  - Source: https://en.wikipedia.org/wiki/Priest%20Drive/Washington%20station
- `Roosevelt/Central Ave`
  - Source: https://en.wikipedia.org/wiki/Roosevelt/Central%20Avenue%20station
- `Sycamore/Main St`
  - Source: https://en.wikipedia.org/wiki/Sycamore/Main%20Street%20station
- `Terminal 3 Station`
  - Source: https://commons.wikimedia.org/wiki/File:Phoenix-Sky_Train_-Terminal_3_Sta..JPG
- `Terminal 4 Station`
  - Source: https://commons.wikimedia.org/wiki/Category:PHX_Sky_Train
- `Thomas/Central Ave`
  - Source: https://en.wikipedia.org/wiki/Thomas/Central%20Avenue%20station
- `University Dr/Rural Rd`
  - Source: https://en.wikipedia.org/wiki/University%20Drive/Rural%20station
- `Veterans Way/College Ave`
  - Source: https://en.wikipedia.org/wiki/Veterans%20Way/College%20Avenue%20station

## Still Missing Exact Verified Photos

- `12th St/Jefferson`
- `24th St/Jefferson`
- `25th Ave/Dunlap`
- `3rd St/Jefferson`
- `50th St/Washington St`
- `Baseline/Central Ave`
- `Broadway/Central Ave`
- `Buckeye/Central Ave`
- `College Ave/Apache`
- `Dorsey Ln/Apache`
- `Dorsey Ln/Apache Blvd`
- `Downtown Phx Hub/1st Ave`
- `Downtown Phx Hub/Jefferson St`
- `East Economy Station`
- `Eleventh St/Mill`
- `Fifth St/Ash`
- `Gilbert Rd/Main St`
- `Hayden Ferry/Rio Salado`
- `Lincoln/1st Ave`
- `Marina Heights/Rio Salado`
- `McClintock Dr/Apache Blvd`
- `Metro Pkwy`
- `Mountain View/25th Ave`
- `Paseo Del Saber/Apache`
- `Pioneer/Central Ave`
- `Price-101/Apache Blvd`
- `Rental Car Center Station`
- `Roeser/Central Ave`
- `Rural/Apache`
- `Smith-Martin/Apache Blvd`
- `Southern/Central Ave`
- `Stapley Dr/Main St`
- `Tempe Beach Park/Rio Salado`
- `Third St/Ash`
- `University Dr/Ash`
- `Van Buren/1st Ave`

## Notes

- Some unmatched stations may still have usable images somewhere, but they were not verified in this pass.
- A future pass should target the `missing` list only.
- The app should continue to prefer honesty over coverage: no generic route photos and no ambiguous substitutions.
