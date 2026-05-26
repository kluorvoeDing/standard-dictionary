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
