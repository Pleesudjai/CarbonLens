# Valley Metro FRC Light-Rail Case Study

> **Purpose**: Real-world case study of fiber-reinforced concrete (FRC) replacing traditional rebar in light-rail track slabs — demonstrating massive cost, time, and sustainability gains.
> **When to use**: When building sustainability impact narratives, quantifying material/carbon savings, or referencing proven infrastructure innovation.
> **Source**: ASCE Civil Engineering Magazine, April 2024
> **Size**: ~250 lines — use a scout sub-agent to check relevance before loading.
> **Cross-checked**: NotebookLM (notebook ff166d8b) on 2026-04-04

---

## Project Facts

| Field | Detail |
|-------|--------|
| Project | Valley Metro Northwest Extension Phase II |
| Location | Phoenix metro, Arizona |
| Scope | 1.6-mile light-rail extension (added to existing 28-mile system) |
| Opened | January 27, 2024 |
| Owner | City of Phoenix / Valley Metro |
| Design | Jacobs |
| Contractor | Kiewit Corp. + McCarthy Construction (JV) |
| Testing | Structural Mechanics and Infrastructure Materials Lab, ASU |

## Key People

- **Barzin Mobasher, Ph.D., P.E., M.ASCE** — Professor, School of Sustainable Engineering and the Built Environment, ASU (article author)
- **Chidchanok Pleesudjai** — Graduate Research Assistant, ASU
- **Devansh Patel** — Graduate Research Assistant, ASU
- **Andrew Haines** — Jacobs
- **Anthony Santana** — City of Phoenix

## The Innovation: FRC Replacing Rebar

Both steel and polymeric fibers were explored to eliminate traditional rebar. The validated design used 2-inch-long steel fibers at 60 lb/cy dosage, batched directly into the concrete mixer at the plant, replacing No. 4 and No. 5 rebar cages in continuous track slabs.

### ASU's Role
The Structural Mechanics and Infrastructure Materials Laboratory at ASU did more than test — they **proactively explored the alternative design solutions and developed the actual design process** for using FRC to replace rebar. This was not just validation; ASU spearheaded the engineering approach.

### Why FRC Was Chosen
- Significant cost increases during planning triggered a sweeping value engineering process (75 options evaluated, 60 accepted)
- Less labor — no rebar forming, placing, or welding
- Thinner slabs (12" vs 14.5") — no rebar cover required
- Corrosion resistance — mitigates stray currents from the third rail's electromagnetic effects
- Enhanced worker safety and simplified formwork
- Sustainability — less steel = lower carbon footprint

## Quantified Impact

### Cost Savings
| Metric | Conventional | FRC | Savings |
|--------|-------------|-----|---------|
| Cost per mile | $17.5M | $5.3M | **~70% reduction** |
| Construction time per mile | 231 days | 121 days | **~50% reduction** |
| Steel per mile (16-ft wide) | 482,000 lbs | 203,000 lbs | **279,000 lbs (58% less)** |
| Slab depth | 14.5 inches | 12 inches | **17% thinner** |

### Project-Wide
- 60 accepted value engineering changes generated **$60M total savings** (23% of construction cost)
- FRC was among the most impactful of those 60 changes

## Technical Testing Results

### Test Specimens
- **Mock-up slab dimensions**: 8 ft long x 3 ft wide (full-scale)
- **RC depth**: 14.5 inches | **FRC depth**: 12 inches (17% thinner, no rebar cover needed)
- **Constructed track slab**: 16 ft wide, continuous pour
- **3 flexural specimens** tested in three-point bending
- **3 fatigue specimens**: 1 conventional RC + 2 FRC (different dosages)

### Instrumentation
- 4 LVDTs (linear variable differential transformers) for centerline deflection
- Strain gages + digital image correlation (photogrammetry) for surface/rebar strains

### Flexural Testing (3-point bending, 7-ft simply supported span)
- **Load**: monotonically increased up to 56 kips (simulating complete loss of ground support)
- **Service load requirement**: 11.25 kips per track slab (safety factor of 2 → test to 22.5 kips)
- **Static tests** recorded load vs. deflection to a maximum capacity of 50 kips

**Conventional RC results:**
- Initial cracking: ~14 kips; rebar then carried tension load
- 76% higher elastic stiffness than FRC (due to greater depth)
- Deflection controlled to 0.1" over 7-ft span (capacity >3x service load)
- Maximum load: 48 kips at 0.9" deflection

**FRC results (60 lb/cy):**
- Primary crack initiation: ~22.5 kips (higher than RC)
- Gradual post-crack stiffness recovery; **higher ductility** than RC
- Composite beam (FRC slab + elastic steel rail): peak 39 kips at 0.35" deflection
- Both RC and FRC exceeded 11.25-kip requirement with safety factor >2

### Fatigue Testing (simulating 45-year service life)
- **Design life**: train passage every 6 minutes, 24/7, for 45 years
- **Protocol**: initial 21-kip load to crack, then 2 million cycles at 4 Hz up to 17 kips (~2x rated axle load)
- **Stiffness measured** every 50,000 cycles as degradation metric

| Specimen | Cycles Completed | Outcome |
|----------|-----------------|---------|
| **FRC (60 lb/cy)** | **2,000,000** | **PASSED — only 6% stiffness loss** |
| Conventional RC | 500,000 | FAILED — significant stiffness loss |
| FRC (lower dosage) | 70,000 | FAILED — disqualified |

### Key Finding
FRC at 60 lb/cy **outperformed** conventional reinforced concrete in fatigue life (4x more cycles) while costing far less.

## Construction Process Advantage

**Traditional**: Form rebar cages → place rebar → pour concrete over cages (labor-intensive, slow)

**FRC**: Batch fibers at plant → pour into minimal formwork → done (straightforward, fast)

This eliminated road closures, traffic disruptions, and traffic control device needs.

## Sustainability Angle

- **58% less steel** per mile (279,000 lbs saved) = directly measurable carbon footprint reduction
- **50% less construction time** (110 fewer days per mile) = less equipment runtime, fuel, emissions
- **17% thinner slabs** = less concrete volume = less cement = less CO2
- **4x longer fatigue life** (2M vs 500K cycles) = less maintenance over 45 years
- **No corrosion risk** from stray electromagnetic currents = longer service life without repair
- **Reduced traffic disruptions** = fewer road closures, less idling vehicle emissions

## Relevance to Hackathon

This case study demonstrates how **material innovation** in infrastructure directly translates to:
1. **Quantifiable environmental impact** (tons of steel saved, CO2 reduced)
2. **Economic feasibility** (70% cost reduction makes adoption realistic)
3. **Scalability** (applicable to any transit system worldwide)
4. **Actionable today** (already deployed and in revenue service)

It aligns perfectly with the Amazon Sustainability Track's criteria: innovation, technical execution, environmental impact, and feasibility.
