# Dawn Audit Fleet Tickets

## Auditor Beta Report
### 1. IEC 62619 (`data/IEC62619.json`)
* **Logic Error (Reverse Formula)**:
  * **Test ID**: `IEC62619-7.2.6` (Forced discharge)
  * **Location**: `conditions.forced_discharge_current.detail`
  * **Discrepancy**: The JSON states the time adjustment formula as `t = Im / It × 90 min`, whereas the raw PDF (Section 7.2.6, Page 20) specifies the formula as `t = (1 It / Im) × 90`.

### 2. UL 1973 (`data/UL1973.json`)
* **Missing Limits**:
  * **Test ID**: `UL1973-16` (High Rate Charge)
  * **Location**: `conditions.charging_rate.detail`
  * **Discrepancy**: JSON states "高於正常充電速率" (Higher than normal charge rate). PDF (Section 16.2, Page 51) requires "**20 % greater** than the maximum specified charging rate".
* **Missing Limits**:
  * **Test ID**: `UL1973-18` (Overload Under Discharge)
  * **Location**: `conditions.discharge_rate.detail`
  * **Discrepancy**: JSON states "過載放電". PDF (Sections 18.3 & 18.7, Page 54-55) specifies "**90 %** of the rated overcurrent protection value", and "**135 %** of the main fuse rating" (or 150 % for Exception 1).
* **Missing Limits**:
  * **Test ID**: `UL1973-30` (Crush Test)
  * **Location**: `conditions.force.value`
  * **Discrepancy**: JSON states "模擬車輛碰撞" without force limit. PDF (Section 30.2 Exception 1, Page 70) specifies maximum force of "**100 ±6 kN**".
* **Missing Limits**:
  * **Test ID**: `UL1973-33` (Drop Impact)
  * **Location**: `conditions.height.detail`
  * **Discrepancy**: JSON says "按標準規定". PDF (Section 33.2, Page 73) gives specific steps: "**100 cm** for 7 kg or less", "**10 cm** for >7 kg but less than 100 kg", and "**2.5 cm** for > 100 kg".
* **Missing Limits**:
  * **Test ID**: `UL1973-E3` (Cell Short Circuit)
  * **Location**: `conditions`
  * **Discrepancy**: Missing duration and thermal limits. PDF (Section E3.1 & E3.2, Page 105) specifies ambient "**25 °C ±5 °C**" and short for "**7 h or until temperatures on the cell cool to within ±10 °C**".
* **Missing Limits**:
  * **Test ID**: `UL1973-E4` (Cell Impact)
  * **Location**: `conditions.impact.detail`
  * **Discrepancy**: JSON says "使用規定重量及高度進行單一衝擊". PDF (Section E11.4.1, Page 107) explicitly requires "**15.8 ±0.1-mm**" bar, "**9.1 ±0.46-kg**" weight, and drop height of "**610 ±25 mm**".
* **Missing Tolerances**:
  * **Test ID**: `UL1973-E6` (Cell Heating)
  * **Location**: `conditions.temperature.detail`
  * **Discrepancy**: JSON says "以 5°C/min 升溫至 130°C". PDF (Section E11.7.1, Page 109) specifies rate of "**5 ±2 °C** per minute to a temperature of **130 ±2 °C**".

## Auditor Gamma Report
### 1. `ULC2580.json` vs `ULC-2580-2022-en.pdf`

- **ULC2580-T25 (Overcharge)**
  - **Logic Error / Missing Limit:** The JSON lists reaching "110% rated capacity" as a valid termination condition without clarifying that it constitutes a failure. PDF 25.3(b) states: "(reaching 110% of the rated charge capacity or the manufacturer-specified charging limit would be considered as a failure of the overcharge evaluation)".

- **ULC2580-T26 (Short Circuit)**
  - **Missing Condition:** The JSON completely omits the second test condition outlined in PDF 26.3: "Testing is repeated at a load that draws a maximum current no less than 15% below the operation of the short circuit protection."
  - **Missing Limit:** For duration, JSON says until fully discharged or 7 hours after stabilization, but misses the PDF 26.5 alternative criteria "or a fire or explosion has occurred."

- **ULC2580-T28 (Temperature Test)**
  - **Missing Tolerance:** The JSON states the temperature is set to the upper limit charging temperature, but misses the stabilization tolerance in PDF 28.2: "all cell temperatures are estimated to be within ±10°C (±18°F) of the chamber temperature for 1 h" before testing.

- **ULC2580-T38 (Crush)**
  - **Hallucination:** The JSON `original_text_snippet` claims: *"The sample is to be crushed in a direction that represents the most likely direction of crush during a vehicle collision. The force applied shall be the maximum expected crush load of the vehicle."* This text DOES NOT exist in the ULC 2580:2022 PDF.
  - **Logic Error / Hallucination:** The PDF 38.2 requires 3 mutually perpendicular directions of press (or 2 for cylindrical), and Exception 1 strictly sets the force at "100 ±6 kN". The JSON incorrectly includes "或預期最大負載" (or expected maximum load) and a single collision direction, which is entirely fabricated and likely pulled from a different standard (e.g., ECE R100).

- **ULC2580-T39 (Thermal Cycling)**
  - **Hallucination:** The JSON `original_text_snippet` claims: *"The sample is to be subjected to thermal cycling in accordance with the manufacturer's specified temperature cycling profile. In the absence of this information, use SAE J2380 or IEC 60068-2-30."* This text DOES NOT exist in the ULC 2580:2022 PDF.
  - **Logic Error / Hallucination:** PDF 39.2 strictly dictates using the "thermal shock test of SAE J2464, except that the temperature extremes are from 85 ±2°C to −40 ±2°C". There is no mention of using a "manufacturer's specified temperature cycling profile".

- **ULC2580-T40 (Salt Spray)**
  - **Missing Limit:** JSON only mentions "IEC 60068-2-52" but misses the specific severity from PDF 40.2: "with a severity level of 6."

- **ULC2580-T41 (Immersion Test)**
  - **Missing Condition:** JSON says "5% 鹽水浸沒 1 小時" but misses PDF 41.2 conditions "at room temperature" and the termination alternative "or until any visible reactions have stopped."

---

### 2. `UL9540A.json` vs `s9540A_5.pdf`

- **UL9540A-MODULE (Module Level Thermal Propagation Test)**
  - **Missing Limit:** The JSON Acceptance Criteria states "模組外表面溫度不超過電池排氣溫度" (module exterior surface temp does not exceed cell vent temp). However, PDF 8.5.1(c) explicitly restricts this to be "as measured adjacent to the initiating cell where the greatest thermal exposure is anticipated." This specific measurement location context is missing.

## Auditor Alpha Report
### 1. UN38.3 (`data/UN38.3.json` vs `UN38.3 sub section.pdf`)
- **Discrepancy found (Hallucination / Logic Error):**
  - **Location:** `UN38.3-T4` (Test T.4: Shock) -> `conditions.small_battery_parameters`
  - **JSON says:** `150gn 或 √(30000/mass) gn（取小值），6ms`
  - **PDF says:** For small batteries, the formula is `Acceleration(gn) = √(100850 / mass)`. 
  - **Issue:** The JSON incorrectly uses the large battery formula `√(30000/mass)` for small batteries instead of the correct `√(100850 / mass)`.

*(No issues found in UL1642.json and IEC62133-2.json)*

## Auditor H1 Report
### 1. UL 2054 (`data/UL2054.json` vs `s2054_3.pdf`)
- **Hallucination / Logic Error (Shock Test)**:
  - **Location**: `UL2054-T20` (Shock Test) -> `conditions.shock_count`
  - **Discrepancy**: JSON states "各方向3次，共9次". PDF strictly specifies a total of 3 shocks (1 per mutually perpendicular direction).
- **Missing Limits (Temperature Cycling Test)**:
  - **Location**: `UL2054-T28` (Temperature Cycling Test) -> `conditions.cycle_profile`
  - **Discrepancy**: JSON misses `±3 °C` tolerances for all stages (70, 20, -40, 20) and the transition time requirement (`< 30 min`).
- **Logic Error (Short-Circuit Test)**:
  - **Location**: `UL2054-T11` (Short-Circuit Test) -> `conditions.duration.detail`
  - **Discrepancy**: JSON states "且" (AND) for termination. PDF uses "and/or".
- **Missing Limits (Projectile Test)**:
  - **Location**: `UL2054-T26` (Projectile Test) -> `conditions`
  - **Discrepancy**: Misses 38 mm burner distance, 610x305 mm cage dimensions, and 16-18 wires/inch mesh density.
- **Missing Limits (Ambient Temperature)**:
  - **Location**: Crush (T18), Impact (T19), Shock (T20), Vibration (T21), Steady Force (T23), Drop (T25)
  - **Discrepancy**: JSON systematically dropped the required initial ambient temperature limits (`20 ± 5°C`).

## Auditor H2 Report
### 2. UL 2056 (`data/UL2056.json` vs `s2056_1.pdf`)
- **Hallucination / Reverse Logic Error**:
  - **Location**: `UL2056-18` (Overload of Output Ports Test) -> `acceptance_criteria.details`
  - **Discrepancy**: JSON allows discoloration ("允許煙霧造成的變色"). PDF Section 18.5 strictly requires **"no discoloration or minor charring"**.
- **Missing Limit / Condition**:
  - **Location**: `UL2056-13` (Abnormal Charging) & `UL2056-14` (Abusive Overcharge) -> `conditions`
  - **Discrepancy**: JSON misses the condition that if a re-settable protective device operates, it must cycle **"a minimum of 10 times during the test"**.
- **Missing Tolerance**:
  - **Location**: `UL2056-16` (Temperature Test) -> `conditions.stabilization.detail`
  - **Discrepancy**: JSON loosely defines thermal stabilization. Misses PDF proportional tolerance: **"intervals of 10 % of the previously elapsed duration of the test, but not less than 15 min"**.
- **Hallucination / Missing Tolerance**:
  - **Location**: `UL2056-23` (Flexing Force Test) -> `conditions.setup.detail`
  - **Discrepancy**: JSON hallucinates placing rods "相距盡可能遠的兩端" (as far apart as possible). PDF strictly says **"with the center of each rod not more than 6.35 mm (1/4 inch) from the edge of the enclosure"**.
- **Missing Limit**:
  - **Location**: `UL2056-19` (Flammability of Photovoltaic Cells Test) -> `acceptance_criteria.details`
  - **Discrepancy**: JSON states Cheesecloth and tissue paper should not char, but misses **"no discoloration"**.

## Auditor H3 Report
### 3. UL 2271 (`data/UL2271.json` vs `s2271_3_20230914.pdf`)
- **Hallucinations**:
  - **Location**: `UL2271-T43` (Thermal Cycling Test) -> `range.detail`
  - **Discrepancy**: JSON explicitly states "在 85 ± 2°C 與 -40 ± 2°C 之間進行 5 次循環". The PDF (Section 43.2) only references SAE J2464 and does NOT specify 5 cycles.
- **Logic Errors**:
  - **Location**: `UL2271-T23` (Overcharge Test) -> `soc.value`
  - **Discrepancy**: JSON lists initial SOC as "滿充 (MOSOC)". PDF Section 23.2 dictates a fully charged sample must be discharged to EODV before being subjected to overcharge.
  - **Location**: `UL2271-T36b` (Drop Test - Service Handling Only) -> `count.detail`
  - **Discrepancy**: JSON states "至少進行 1 次跌落". PDF Section 36.2.3 enforces conditional logic about flat drops versus non-flat drops.
- **Missing Limits and Tolerances**:
  - **Location**: T24 (High Rate Charge), T26 (Overload Under Discharge), T30 (Dielectric Voltage Withstand), T32 (Grounding Continuity), T34 (Shock), T35 (Crush), T36a (Drop), T38 (Handle Loading), T40 (Strain Relief).
  - **Discrepancy**: Missing specific values like "20 % greater", "1,000 V plus twice rated voltage", "11 ms, 15 ms, 20 ms durations", "±0.01 m tolerance", "25.4-mm increments", etc.
- **Translation Context Errors**:
  - **Location**: `UL2271-T36a` (Drop Test) -> `cold_condition.detail`
  - **Discrepancy**: JSON says "用於 0°C 以下" (below 0°C). PDF states "intended for use in 0 °C temperatures" (at 0°C).
- **Acceptance Criteria Omissions**:
  - **Location**: Widespread across T23, T24, T25, T26, T27, T34, T36a, T41, T42 -> `acceptance_criteria.details`
  - **Discrepancy**: Omits "Combustible Concentrations" (C), "Electric shock hazard" (S), and "Loss of protection controls" (P) from non-compliant results which PDF explicitly enforces.

## Auditor I1 Report
### 4. UL 3030 (`data/UL3030.json` vs `s3030_1.pdf`)
- **Reverse Logic Error / Translation Error**:
  - **Location**: `UL3030-32.8` (Imbalanced charging) -> `conditions.preparation.value`
  - **Discrepancy**: JSON logic is reversed. It says "1 個電芯完放，其餘 50% SOC". PDF (32.8.2) requires ALL cells EXCEPT ONE to be fully discharged, and the single remaining cell to be at 50% SOC.
- **Context Error / Misattribution**:
  - **Location**: `global_exemptions` -> `GE-01`
  - **Discrepancy**: JSON incorrectly equates 17.3.2(a) to UL 62133, and improperly exempts UL 62133 batteries from tests. PDF states 17.3.2(a) is UL 2580, and explicitly requires UL 62133 batteries to undergo these tests.
- **Missing Limits / Conditions**:
  - **Location**: `UL3030-32.6` (Overcharge) & `UL3030-32.7` (Short circuit) -> `conditions`
  - **Discrepancy**: Missing the critical retry condition: "repeated at 90% of the trip point... or at some percentage... that allows charging/discharging for at least 10 min".
- **Hallucination**:
  - **Location**: `UL3030-32.9` (Shock test) -> `acceptance_criteria.details`
  - **Discrepancy**: JSON hallucinated "結構與電氣連接不鬆脫" (No loosening of parts) which applies to Vibration Test, not Shock Test.
- **Missing Tolerances & Tools**:
  - **Location**: `UL3030-33.2` (Vibration Test) -> `conditions.amplitude.value`
  - **Discrepancy**: JSON lists "1.0 mm", PDF specifies asymmetrical tolerance "1.0 +0.1, -0 mm".
  - **Location**: `UL3030-34.1` (Impact) & `UL3030-34.2` (Drop) -> `acceptance_criteria.details`
  - **Discrepancy**: JSON omits the required verification tool "the articulate probe shown in Figure 12.1".

## Auditor I2 Report
### 5. UL 9540 (`data/UL9540.json` vs `s9540_3.pdf`)
- **Hallucinations / Logic Errors**:
  - **Location**: `UL9540-32` (Dielectric Voltage Withstand Test) -> `tests[1].conditions.test_voltage`
  - **Discrepancy**: JSON hallucinates `2倍額定電壓`. PDF (Section 32.2) explicitly refers to UL 62368-1 / CSA C22.2 No. 62368-1 "Determining clearances using required withstand voltage".
  - **Location**: `UL9540-34` (Equipment Grounding and Bonding Test)
  - **Discrepancy**: JSON applies exemptions ("若通過生產實踐審查確定良好接地可豁免") and limits from *Electrical Production Tests* (Section 42.2.1) to the Type Test (Section 34).
  - **Location**: `global_exemptions[0].source_reference`
  - **Discrepancy**: JSON hallucinates `4.3.1, 4.3.2` for capacity limits. The correct source in PDF is `1.6`.
- **Missing Limits & Conditions**:
  - **Location**: `UL9540-30` (Normal Operations Test) -> `tests[0].conditions`
  - **Discrepancy**: Misses thermal equilibrium criteria (`±2 °C` over 3 measurements at 10% elapsed time min 15min).
  - **Location**: `UL9540-33` (Impulse Test) -> `tests[2].conditions.count`
  - **Discrepancy**: JSON specifies "正負極各 3 次". Misses PDF higher limit: "For circuits over 1000 V, 5 pulses at each polarity shall be applied."
  - **Location**: `UL9540-35` (Insulation Resistance Test) -> `tests[4].exemptions`
  - **Discrepancy**: Misses Exception No. 1 regarding previous evaluation as part of technology safety standard.
  - **Location**: `UL9540-40.2` (Enclosure Impact) -> `tests[6].conditions.impact_count`
  - **Discrepancy**: JSON states "3 次衝擊", PDF requires a "minimum" of 3 impacts.

## Auditor I3 Report
### 6. UL 1642-2022 (`data/UL1642-2022.json` vs `s1642_6.pdf`)
- **Missing Limits (Sample Size)**:
  - **Location**: `UL1642-T12` (Forced-Discharge Test) -> `conditions.sample_size`
  - **Discrepancy**: JSON states "5顆". PDF Tables 6.1/6.2 require 5+5 samples based on conditioning (e.g. Fully Charged and One-Half Discharged).
  - **Location**: `UL1642-T14A` (Round Bar Crush Test) -> `conditions`
  - **Discrepancy**: The `sample_size` object is completely missing. Requires 5+5 sample distribution.
- **Missing Acceptance Criteria Limit**:
  - **Location**: `UL1642-T14A` (Round Bar Crush Test) -> `acceptance_criteria.details`
  - **Discrepancy**: JSON only lists "所有樣品不得爆炸或起火". Omits the strict condition for technician-replaceable cells from Section 5.1.2.
- **Missing Test Reference**:
  - **Location**: `global_exemptions` -> `GE-04` -> `applicable_tests`
  - **Discrepancy**: Missing `"UL1642-T14A"` in the exemption list.
- **Hallucinated Simplification (Li-ion Preconditioning)**:
  - **Location**: `UL1642-T17` (Heating Test) -> `conditions.li_ion_preconditioning`
  - **Discrepancy**: JSON says "上限溫度及下限溫度". PDF Table 6.3 requires using 45°C/10°C limits, or applying strict ±5°C shifts to manufacturer limits if they exceed these bounds.

## Auditor J1 Report
### 7. UL 2743 (`data/UL2743.json` vs `s2743_3.pdf`)
- **Missing Conditions (Output connections short circuit test)**:
  - **Location**: `UL2743-T55-2` -> `conditions`
  - **Discrepancy**: Misses the active supply requirement: "power pack connected to a source of supply adjusted to its rated voltage". Misses the location requirement: "the short shall also occur at the end of the cable" if booster cable is provided.
  - **Location**: `UL2743-T55-2` -> `acceptance_criteria.details`
  - **Discrepancy**: Misses post-test Dielectric Voltage Withstand Test from Section 55.1.2.
- **Missing Limits / Context (Overcharging Test)**:
  - **Location**: `UL2743-T55-9` -> `conditions.charging_current.detail`
  - **Discrepancy**: JSON missed critical single fault requirement: "with or without a single fault condition in the charging protection circuit".
  - **Location**: `UL2743-T55-9` -> `acceptance_criteria.details`
  - **Discrepancy**: Misses post-test Dielectric Voltage Withstand Test from Section 55.1.2. Misses allowance: "Venting of the cells is acceptable".
- **Missing Limit / Translation Error (Drop Test)**:
  - **Location**: `UL2743-T60-3` -> `conditions.temperature.detail`
  - **Discrepancy**: Misses "or the minimum operating temperature specified by the manufacturer if lower than 0 °C (32 °F)".
  - **Location**: `UL2743-T60-3` -> `acceptance_criteria.details`
  - **Discrepancy**: JSON omitted "metallic" (金屬) for enclosure distortion, hallucinating the requirement for non-metallic enclosures.

## Auditor J3 Report
### 8. GBT 36276-2023 (`data/GBT36276.json` vs `GBT 36276-2023.pdf`)
- **Hallucinations & Logic Errors**:
  - **Location**: `ELEC-OC` (6.7.1.1), `ELEC-SC-EXT` (6.7.1.4), `MECH-DROP` (6.7.2.2)
  - **Discrepancy**: JSON hallucinates `不应漏液` (No leakage) as an acceptance criterion where it is not specified in the PDF.
  - **Location**: `ELEC-OCUR` (6.7.1.3 Overload)
  - **Discrepancy**: JSON misinterprets `记录外壳破裂及破裂位置` as an acceptance criterion `外壳不得破裂及破裂位置`.
  - **Location**: `THERM-ABUSE` (6.7.4.2 Thermal Runaway)
  - **Discrepancy**: JSON only lists items to *record*, completely missing the actual criteria (`表面温度应大于 90 ℃`, `不应起火/爆炸/防爆阀外破裂`).
  - **Location**: `THERM-PROP` (6.7.4.3 Thermal Runaway Propagation)
  - **Discrepancy**: JSON hallucinates `加热/过充/针刺` as triggers. PDF explicitly requires only constant current overcharge (`恒流充电`).
- **Missing Limits & Conditions**:
  - **Location**: Multiple cell tests (`ELEC-OC`, `ELEC-OD`, `ELEC-OCUR`, `ELEC-SC-EXT`, `MECH-CRUSH`, `MECH-DROP`)
  - **Discrepancy**: Systematically missing `不应在防爆阀或泄压点之外的位置发生破裂` and `不应冒烟` where applicable.
  - **Location**: `ELEC-IR` (6.7.1.5 Insulation) & `ELEC-IR` (6.7.1.6 Withstand Voltage)
  - **Discrepancy**: Vague criteria in JSON. Completely misses precise limits: `≥ 1000 Ω/V` and `< 10 mA` leakage current.
  - **Location**: `MECH-CRUSH` (6.7.2.1)
  - **Discrepancy**: Misses initial speed requirement `初始值设置为 5 mm/s`.
  - **Location**: `THERM-ABUSE` (6.7.4.2) & `THERM-PROP` (6.7.4.3)
  - **Discrepancy**: Misses observation condition `观察 1 h`. Misses post-test insulation requirement `绝缘性能应满足 5.6.1.5.1`.

## Auditor J2 Report
### 9. SAND2017 (`data/SAND2017.json` vs `SAND2017-6925.pdf`)
- **Status**: No issues found. JSON data extraction is flawless and rigorously aligns with the RAW PDF.

## Auditor K1 Report
### 10. JISC8714 (`data/JISC8714.json` vs `JISC8714_2007.pdf`)
- **Missing Limits (External Short Circuit)**:
  - **Location**: `JISC8714-CELL-SC` -> `conditions`
  - **Discrepancy**: Omits duration limit: "maintained for 24 hours or until the difference between cell surface temp and ambient drops to 20% or less of its maximum value, whichever is shorter".
  - **Location**: `JISC8714-PACK-SC` -> `conditions`
  - **Discrepancy**: Misses dual-temperature charging requirement (45°C and 10°C) requiring 10 samples total (5+5). Misses duration condition and 1 hour observation rule.
- **Logic Error**:
  - **Location**: `test_sequence`
  - **Discrepancy**: Incorrectly implies pack-level short circuit test ignores upper/lower temperature charging regimen.
- **Missing Limits / Details (Forced Internal Short Circuit)**:
  - **Location**: `JISC8714-FISC` -> `conditions`
  - **Discrepancy**: Omits pressing speed: `0.1 mm/s`. Misses pressure jig specifics (10x10mm nitrile rubber, plus 5x5mm acrylic plate).
- **Missing Details (Drop Test)**:
  - **Location**: `JISC8714-DROP` -> `conditions`
  - **Discrepancy**: Omits the alternative drop surface "steel plate".
