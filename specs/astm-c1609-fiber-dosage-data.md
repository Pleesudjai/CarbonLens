# ASTM C1609 Fiber Dosage Test Results — 19 Specimens
Date: 2026-04-04
Source: ASU Structural Mechanics and Infrastructure Materials Laboratory
Tested by: Chidchanok Pleesudjai, Mobasher Group
Back-calculation: BackCalc_ASTMC1609.m (multi-linear strain compatibility model)

## Test Setup

| Parameter | Value |
|-----------|-------|
| Standard | ASTM C1609 / C1609M — Standard Test Method for Flexural Performance of Fiber-Reinforced Concrete |
| Loading | Four-point bending |
| Beam dimensions | 150 mm × 150 mm × 450 mm (b × h × L) |
| Load span | 150 mm (third-point loading) |
| Shear span | 150 mm |
| Deflection reference | L/150 = 3.0 mm (net midpoint deflection) |
| Instrumentation | LVDTs for midpoint deflection, strain gages |

## Specimen Registry

### Group 1: Polymer-A Polymer-A Fibers (PP-based)

| Specimen ID | Fiber Brand | Dosage (lb/cy) | Data Source |
|-------------|-------------|----------------|-------------|
| Polymer-A_N3_5lb | Polymer-A | 5 | 2018 SRP |
| Polymer-A_N4_5lb | Polymer-A | 5 | 2018 SRP |
| Polymer-A_N3_7lb | Polymer-A | 7 | 2018 SRP |
| Polymer-A1_9lb | Polymer-A | 9 | 2019 SRP |
| Polymer-A2_9lb | Polymer-A | 9 | 2019 SRP |
| Polymer-A3_9lb | Polymer-A | 9 | 2019 SRP |
| Polymer-A4D_9lb | Polymer-A | 9 | 2019 SRP |

### Group 2: Polypropylene (PP) Macro Fibers

| Specimen ID | Fiber Brand | Dosage (lb/cy) | Data Source |
|-------------|-------------|----------------|-------------|
| PP12A_12lb | Polymer-B | 12 | 2019 Tunnel |
| PP12B_12lb | Polymer-B | 12 | 2019 Tunnel |
| PP12C_12lb | Polymer-B | 12 | 2019 Tunnel |
| PP12D_12lb | Polymer-B | 12 | 2019 Tunnel |
| PP15A_14lb | Polymer-B | 14 | 2019 Tunnel |

### Group 3: Steel Fibers

| Specimen ID | Fiber Brand | Dosage (lb/cy) | Data Source |
|-------------|-------------|----------------|-------------|
| ST50A_50lb | Steel (BASF) | 50 | 2019 Tunnel |
| ST50B_50lb | Steel (BASF) | 50 | 2019 Tunnel |
| ST50C_50lb | Steel (BASF) | 50 | 2019 Tunnel |
| ST50D_50lb | Steel (BASF) | 50 | 2019 Tunnel |
| VM_SF2_25lb | Steel (Valley Metro) | 25 | 2019 Valley Metro |
| VM_SF1_65lb | Steel (Valley Metro) | 65 | 2019 Valley Metro |
| VM_SF2_65lb | Steel (Valley Metro) | 65 | 2019 Valley Metro |

## Back-Calculated Material Properties

### Elastic Properties

| Specimen | Fiber | Dosage (lb/cy) | E (MPa) | sigma_cr (MPa) | epsilon_cr |
|----------|-------|----------------|---------|-----------------|------------|
| Polymer-A_N3_5lb | Polymer-A | 5 | 31,463 | 3.44 | 1.094e-4 |
| Polymer-A_N4_5lb | Polymer-A | 5 | 36,573 | 4.39 | 1.200e-4 |
| Polymer-A_N3_7lb | Polymer-A | 7 | 24,870 | 3.29 | 1.324e-4 |
| Polymer-A1_9lb | Polymer-A | 9 | 32,134 | 4.16 | 1.296e-4 |
| Polymer-A2_9lb | Polymer-A | 9 | 39,531 | 3.52 | 8.904e-5 |
| Polymer-A3_9lb | Polymer-A | 9 | 30,437 | 3.97 | 1.305e-4 |
| Polymer-A4D_9lb | Polymer-A | 9 | 34,978 | 4.20 | 1.200e-4 |
| PP12A_12lb | PP | 12 | 39,513 | 4.74 | 1.200e-4 |
| PP12B_12lb | PP | 12 | 45,000 | 4.43 | 9.845e-5 |
| PP12C_12lb | PP | 12 | 36,061 | 4.33 | 1.200e-4 |
| PP12D_12lb | PP | 12 | 36,688 | 4.40 | 1.200e-4 |
| PP15A_14lb | PP | 14 | 42,273 | 5.07 | 1.200e-4 |
| ST50A_50lb | Steel | 50 | 45,000 | 5.74 | 1.275e-4 |
| ST50B_50lb | Steel | 50 | 40,573 | 4.87 | 1.200e-4 |
| ST50C_50lb | Steel | 50 | 45,000 | 5.65 | 1.256e-4 |
| ST50D_50lb | Steel | 50 | 45,000 | 6.05 | 1.345e-4 |
| VM_SF2_25lb | Steel | 25 | 36,315 | 4.36 | 1.200e-4 |
| VM_SF1_65lb | Steel | 65 | 24,107 | 2.89 | 1.200e-4 |
| VM_SF2_65lb | Steel | 65 | 35,927 | 4.31 | 1.200e-4 |

### Post-Crack Residual Strength Ratios (mu values)

The multi-linear tension model uses 5 post-crack stages. mu = residual stress / cracking stress.

| Specimen | mu1 | mu2 | mu3 | mu4 | mu5 |
|----------|-----|-----|-----|-----|-----|
| Polymer-A_N3_5lb | 0.300 | 0.100 | 0.151 | 0.222 | 0.079 |
| Polymer-A_N4_5lb | 0.300 | 0.100 | 0.050 | 0.250 | 0.059 |
| Polymer-A_N3_7lb | 0.300 | 0.100 | 0.126 | 0.250 | 0.100 |
| Polymer-A1_9lb | 0.300 | 0.100 | 0.145 | 0.097 | 0.043 |
| Polymer-A2_9lb | 0.300 | 0.100 | 0.127 | 0.236 | 0.100 |
| Polymer-A3_9lb | 0.302 | 0.194 | 0.290 | 0.108 | 0.026 |
| Polymer-A4D_9lb | 0.302 | 0.134 | 0.190 | 0.250 | 0.100 |
| PP12A_12lb | 0.500 | 0.207 | 0.370 | 0.260 | 0.133 |
| PP12B_12lb | 0.500 | 0.207 | 0.548 | 0.220 | 0.150 |
| PP12C_12lb | 0.500 | 0.200 | 0.440 | 0.400 | 0.150 |
| PP12D_12lb | 0.500 | 0.200 | 0.566 | 0.050 | 0.150 |
| PP15A_14lb | 0.500 | 0.207 | 0.545 | 0.400 | 0.024 |
| ST50A_50lb | 0.600 | 0.300 | 0.352 | 0.600 | 0.079 |
| ST50B_50lb | 0.600 | 0.300 | 0.261 | 0.600 | 0.031 |
| ST50C_50lb | 0.600 | 0.300 | 0.496 | 0.060 | 0.250 |
| ST50D_50lb | 0.600 | 0.300 | 0.150 | 0.227 | 0.039 |
| VM_SF2_25lb | 0.600 | 0.300 | 0.150 | 0.600 | 0.020 |
| VM_SF1_65lb | 0.600 | 0.300 | 0.150 | 0.060 | 0.250 |
| VM_SF2_65lb | 0.600 | 0.300 | 0.153 | 0.397 | 0.234 |

### Fracture Energy and Toughness

| Specimen | Fiber | Dosage (lb/cy) | Gf_simple (J/m2) | Gf_corrected (J/m2) | kd at L/150 (mm) | A at L/150 (mm2) |
|----------|-------|----------------|-------------------|----------------------|-------------------|-------------------|
| Polymer-A_N3_5lb | Polymer-A | 5 | 1,713 | 1,994 | 21.2 | 19,323 |
| Polymer-A_N4_5lb | Polymer-A | 5 | 461 | 517 | 16.4 | 20,038 |
| Polymer-A_N3_7lb | Polymer-A | 7 | 1,036 | 1,238 | 24.5 | 18,830 |
| Polymer-A1_9lb | Polymer-A | 9 | 3,102 | 3,584 | 20.1 | 19,478 |
| Polymer-A2_9lb | Polymer-A | 9 | 2,114 | 2,440 | 20.0 | 19,497 |
| Polymer-A3_9lb | Polymer-A | 9 | 5,680 | 7,170 | 31.2 | 17,825 |
| Polymer-A4D_9lb | Polymer-A | 9 | 4,170 | 5,031 | 25.7 | 18,649 |
| PP12A_12lb | PP | 12 | 5,696 | 7,598 | 37.5 | 16,869 |
| PP12B_12lb | PP | 12 | 6,247 | 8,753 | 42.9 | 16,058 |
| PP12C_12lb | PP | 12 | 5,181 | 7,077 | 40.2 | 16,473 |
| PP12D_12lb | PP | 12 | 7,673 | 10,841 | 43.8 | 15,925 |
| PP15A_14lb | PP | 14 | 8,313 | 11,720 | 43.6 | 15,959 |
| ST50A_50lb | Steel | 50 | 7,309 | 9,984 | 40.2 | 16,472 |
| ST50B_50lb | Steel | 50 | 4,478 | 6,111 | 40.1 | 16,488 |
| ST50C_50lb | Steel | 50 | 11,106 | 15,549 | 42.9 | 16,071 |
| ST50D_50lb | Steel | 50 | 4,663 | 7,132 | 51.9 | 14,709 |
| VM_SF2_25lb | Steel | 25 | 4,432 | 6,065 | 40.4 | 16,443 |
| VM_SF1_65lb | Steel | 65 | 189 | 240 | 31.6 | 17,766 |
| VM_SF2_65lb | Steel | 65 | 4,131 | 5,431 | 35.9 | 17,114 |

## Summary by Fiber Type and Dosage

### Average Properties by Group

| Fiber Type | Dosage (lb/cy) | n | Avg E (MPa) | Avg sigma_cr (MPa) | Avg Gf_corrected (J/m2) | Avg mu1 |
|------------|----------------|---|------------|---------------------|-------------------------|---------|
| Polymer-A | 5 | 2 | 34,018 | 3.92 | 1,256 | 0.300 |
| Polymer-A | 7 | 1 | 24,870 | 3.29 | 1,238 | 0.300 |
| Polymer-A | 9 | 4 | 34,270 | 3.96 | 4,556 | 0.301 |
| PP | 12 | 4 | 39,316 | 4.48 | 8,567 | 0.500 |
| PP | 14 | 1 | 42,273 | 5.07 | 11,720 | 0.500 |
| Steel | 25 | 1 | 36,315 | 4.36 | 6,065 | 0.600 |
| Steel | 50 | 4 | 43,893 | 5.58 | 9,694 | 0.600 |
| Steel | 65 | 2 | 30,017 | 3.60 | 2,836 | 0.600 |

### Key Observations

1. **Steel fibers at 50 lb/cy** show the highest cracking strength (avg 5.58 MPa) and strong fracture energy (avg 9,694 J/m2)
2. **PP fibers at 12-14 lb/cy** provide excellent toughness (avg 8,567-11,720 J/m2) with good post-crack residual (mu1 = 0.50)
3. **Steel fibers at 25 lb/cy** (Valley Metro dosage range) show moderate performance — the 60 lb/cy dosage used in Valley Metro production falls between the 50 lb and 65 lb test data
4. **Polymer-A at 9 lb/cy** shows highly variable Gf (3,584 to 7,170 J/m2), reflecting sensitivity to fiber distribution at lower dosages
5. **VM_SF1_65lb** shows anomalously low Gf (240 J/m2) — possibly a defective specimen or poor fiber distribution

## Relevance to CarbonLens

These test results support the section family comparisons in the analysis engine:

| CarbonLens Section | Relevant Test Data | Key Insight |
|--------------------|-------------------|-------------|
| `conventional_rc` | Baseline (no fibers) | Traditional rebar cage — no post-crack residual from fibers |
| `fiber_reduced` (60 lb/cy steel) | ST50 series + VM_SF series | Steel fibers at 50-65 lb/cy provide mu1=0.60, enabling 17% thinner slab |
| `low_cement_rc` | Not directly tested | SCM replacement affects cement carbon, not fiber performance |

The Valley Metro project used **60 lb/cy steel fibers** (2-inch hooked-end), which falls between the ST50 (50 lb) and VM_SF (25-65 lb) test series. The 60 lb/cy dosage was validated through the fatigue testing described in Mobasher (2024).
