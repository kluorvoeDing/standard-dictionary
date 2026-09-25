// Condition-key dictionary: Traditional Chinese labels, display category and sort priority.
//
// category:
//   electrical / environmental / timing / mechanical / practical — shown as rows in the comparison table
//   procedure — sample quantity, pre-conditioning, observation period. These were mostly back-filled
//               as one generic sentence per standard (Phase 2) and have not been checked against the
//               source text yet, so the table keeps them in a collapsed section and never diff-marks them.
export const PARAMETER_DICTIONARY = {
  // ── 電氣條件 ──
  soc: { label: '荷電狀態 (SOC)', category: 'electrical', priority: 1 },
  pre_condition: { label: '樣品初始狀態', category: 'electrical', priority: 1 },
  voltage: { label: '試驗電壓', category: 'electrical', priority: 2 },
  charging_voltage: { label: '充電電壓', category: 'electrical', priority: 2 },
  supply_voltage: { label: '供電電壓', category: 'electrical', priority: 2 },
  final_voltage: { label: '終止電壓', category: 'electrical', priority: 2 },
  current: { label: '試驗電流', category: 'electrical', priority: 3 },
  charging_current: { label: '充電電流', category: 'electrical', priority: 3 },
  discharge_current: { label: '放電電流', category: 'electrical', priority: 3 },
  forced_discharge_current: { label: '強制放電電流', category: 'electrical', priority: 3 },
  charging_rate: { label: '充電倍率', category: 'electrical', priority: 3 },
  discharge_rate: { label: '放電倍率', category: 'electrical', priority: 3 },
  charge: { label: '充電條件', category: 'electrical', priority: 4 },
  discharge: { label: '放電條件', category: 'electrical', priority: 4 },
  charging_procedure: { label: '充電程序', category: 'electrical', priority: 4 },
  external_resistance: { label: '外部電阻', category: 'electrical', priority: 5 },
  load: { label: '負載', category: 'electrical', priority: 5 },
  short_circuit_detection: { label: '短路判定', category: 'electrical', priority: 6 },

  // ── 環境與溫度條件 ──
  temperature: { label: '環境溫度', category: 'environmental', priority: 10 },
  test_temperature: { label: '試驗溫度', category: 'environmental', priority: 10 },
  chamber_temperature: { label: '試驗箱溫度', category: 'environmental', priority: 10 },
  initial_temperature: { label: '初始溫度', category: 'environmental', priority: 10 },
  ambient: { label: '環境條件', category: 'environmental', priority: 10 },
  target_temperature: { label: '目標溫度', category: 'environmental', priority: 11 },
  preconditioning_temperature: { label: '預熱溫度', category: 'environmental', priority: 11 },
  high_temperature: { label: '高溫條件', category: 'environmental', priority: 11 },
  low_temperature: { label: '低溫條件', category: 'environmental', priority: 12 },
  temp_range: { label: '溫度範圍', category: 'environmental', priority: 12 },
  heating_rate: { label: '升溫速率', category: 'environmental', priority: 13 },
  heating: { label: '加熱方式', category: 'environmental', priority: 13 },
  heating_power: { label: '加熱功率', category: 'environmental', priority: 13 },
  oven_type: { label: '烘箱類型', category: 'environmental', priority: 13 },
  humidity: { label: '相對濕度', category: 'environmental', priority: 14 },
  altitude: { label: '模擬高度', category: 'environmental', priority: 15 },
  pressure: { label: '環境氣壓', category: 'environmental', priority: 16 },
  liquid: { label: '浸泡液體', category: 'environmental', priority: 17 },
  depth: { label: '深度', category: 'environmental', priority: 17 },
  cold_conditioning: { label: '低溫調節', category: 'environmental', priority: 18 },

  // ── 時間、次數與持續時長 ──
  duration: { label: '維持時間', category: 'timing', priority: 20 },
  test_duration: { label: '試驗時長', category: 'timing', priority: 20 },
  time: { label: '持續時長', category: 'timing', priority: 20 },
  hold_time: { label: '維持時間', category: 'timing', priority: 20 },
  dwell_time: { label: '停留時間', category: 'timing', priority: 21 },
  transition_time: { label: '轉換時間', category: 'timing', priority: 21 },
  cycling_time: { label: '循環時長', category: 'timing', priority: 21 },
  interval: { label: '間隔時間', category: 'timing', priority: 22 },
  cycles: { label: '循環次數', category: 'timing', priority: 23 },
  repetition: { label: '重複次數', category: 'timing', priority: 23 },
  count: { label: '次數', category: 'timing', priority: 23 },
  cycle_params: { label: '循環參數', category: 'timing', priority: 23 },

  // ── 機械條件與治具 ──
  force: { label: '施加力 / 擠壓力', category: 'mechanical', priority: 30 },
  crush_params: { label: '擠壓條件', category: 'mechanical', priority: 30 },
  crush_speed: { label: '擠壓速度', category: 'mechanical', priority: 31 },
  speed: { label: '施加速度', category: 'mechanical', priority: 31 },
  drop_height: { label: '跌落高度', category: 'mechanical', priority: 32 },
  height: { label: '高度', category: 'mechanical', priority: 32 },
  drop_count: { label: '跌落次數', category: 'mechanical', priority: 32 },
  drop_surface: { label: '撞擊面', category: 'mechanical', priority: 33 },
  impact_mass: { label: '衝擊重物質量', category: 'mechanical', priority: 34 },
  impact_height: { label: '衝擊落錘高度', category: 'mechanical', priority: 35 },
  impact_count: { label: '撞擊次數', category: 'mechanical', priority: 35 },
  impact: { label: '撞擊條件', category: 'mechanical', priority: 35 },
  impactor: { label: '衝擊壓頭規格', category: 'mechanical', priority: 36 },
  apparatus: { label: '治具與設備', category: 'mechanical', priority: 37 },
  steel_bar: { label: '鋼棒尺寸', category: 'mechanical', priority: 38 },
  needle_diameter: { label: '針刺直徑與材質', category: 'mechanical', priority: 39 },
  needle_speed: { label: '針刺速度', category: 'mechanical', priority: 40 },
  vibration: { label: '振動條件', category: 'mechanical', priority: 41 },
  vibration_frequency: { label: '振動頻率', category: 'mechanical', priority: 41 },
  vibration_profile: { label: '振動譜', category: 'mechanical', priority: 41 },
  waveform: { label: '波形', category: 'mechanical', priority: 41 },
  amplitude: { label: '振幅', category: 'mechanical', priority: 41 },
  acceleration: { label: '加速度 / 衝擊量', category: 'mechanical', priority: 42 },
  shock: { label: '衝擊條件', category: 'mechanical', priority: 42 },
  shock_params: { label: '衝擊參數', category: 'mechanical', priority: 42 },
  pulse: { label: '衝擊脈衝', category: 'mechanical', priority: 42 },
  pulse_duration: { label: '脈衝持續時間', category: 'mechanical', priority: 42 },
  shock_count: { label: '衝擊次數', category: 'mechanical', priority: 42 },
  direction: { label: '方向', category: 'mechanical', priority: 43 },
  orientation: { label: '樣品方位', category: 'mechanical', priority: 44 },
  orientation_coin: { label: '方位（鈕扣型）', category: 'mechanical', priority: 44 },
  orientation_cylindrical: { label: '方位（圓柱型）', category: 'mechanical', priority: 44 },
  orientation_cylindrical_pouch: { label: '方位（圓柱／軟包）', category: 'mechanical', priority: 44 },
  orientation_prismatic: { label: '方位（方形）', category: 'mechanical', priority: 44 },
  orientation_prismatic_non_li_ion: { label: '方位（方形，非鋰離子）', category: 'mechanical', priority: 44 },
  cage: { label: '金屬網罩', category: 'mechanical', priority: 45 },

  // ── 試驗設定與判定相關 ──
  method: { label: '試驗方法', category: 'practical', priority: 50 },
  setup: { label: '試驗設置', category: 'practical', priority: 50 },
  procedure: { label: '試驗程序', category: 'practical', priority: 50 },
  profile: { label: '試驗曲線', category: 'practical', priority: 50 },
  standard: { label: '引用標準', category: 'practical', priority: 50 },
  operation: { label: '操作方式', category: 'practical', priority: 51 },
  operating_conditions: { label: '運行條件', category: 'practical', priority: 51 },
  condition: { label: '試驗條件', category: 'practical', priority: 51 },
  special_condition_1: { label: '特殊條件', category: 'practical', priority: 51 },
  control: { label: '控制方式', category: 'practical', priority: 51 },
  trigger: { label: '觸發方式', category: 'practical', priority: 52 },
  trigger_method: { label: '觸發方式', category: 'practical', priority: 52 },
  ignition_detection: { label: '起火偵測', category: 'practical', priority: 52 },
  dut_state: { label: '樣品狀態', category: 'practical', priority: 53 },
  sample_state: { label: '樣品狀態', category: 'practical', priority: 53 },
  sample_requirement: { label: '樣品要求', category: 'practical', priority: 53 },
  termination: { label: '試驗終止條件', category: 'practical', priority: 54 },
  protective_device: { label: '保護裝置狀態', category: 'practical', priority: 55 },
  fault_condition: { label: '單一故障設定', category: 'practical', priority: 55 },
  applicability: { label: '適用對象與條件', category: 'practical', priority: 56 },

  // ── 試驗程序（預設收起，不標示差異）──
  sample_quantity: { label: '樣品數量', category: 'procedure', priority: 60 },
  preparation: { label: '前置準備', category: 'procedure', priority: 61 },
  pre_conditioning: { label: '前置處理', category: 'procedure', priority: 61 },
  cycling: { label: '前置循環次數', category: 'procedure', priority: 61 },
  observation_period: { label: '靜置與觀察時間', category: 'procedure', priority: 62 },
  monitoring_period: { label: '試驗後監控', category: 'procedure', priority: 62 },
  post_test: { label: '試驗後處理', category: 'procedure', priority: 63 },
  post_test_cycle: { label: '試驗後循環', category: 'procedure', priority: 63 },
  post_storage: { label: '試驗後存放', category: 'procedure', priority: 63 },
  teardown: { label: '試驗後拆解', category: 'procedure', priority: 64 },
};

// Raw keys that mean exactly the same thing as a dictionary key. Every entry was checked against the
// values it carries in data/*.json before being merged.
export const ALIASES = {
  state_of_charge: 'soc',
  test_voltage: 'voltage',
  charge_voltage: 'charging_voltage',
  test_current: 'current',
  charge_current: 'charging_current',
  resistance: 'external_resistance', // short-circuit and forced-discharge loads (mΩ)
  ext_res: 'external_resistance',
  short_circuit_resistance: 'external_resistance',
  ambient_temperature: 'temperature',
  ambient_temp: 'temperature',
  temp: 'temperature',
  target_temp: 'target_temperature',
  high_temp: 'high_temperature',
  low_temp: 'low_temperature',
  temperatures: 'temp_range',
  ambient_condition: 'ambient',
  short_circuit_duration: 'duration',
  ramp_rate: 'heating_rate',
  cycle_count: 'cycles',
  shocks: 'shock_count',
  crush_force: 'force',
  pressure_force: 'force',
  press_speed: 'crush_speed',
  surface: 'drop_surface',
  drop_mass: 'impact_mass',
  weight: 'impact_mass',
  bar_diameter: 'steel_bar',
  pressing_jig: 'apparatus',
  frequency: 'vibration_frequency',
  frequency_range: 'vibration_frequency',
  directions: 'direction',
  fault: 'fault_condition',
  end_conditions: 'termination',
  end_condition: 'termination',
  stop_condition: 'termination',
  termination_criteria: 'termination',
  sample_size: 'sample_quantity',
  samples: 'sample_quantity',
  preconditioning: 'pre_conditioning',
  observation: 'observation_period',
  observation_time: 'observation_period',
  rest_time: 'observation_period',
  rest_period: 'observation_period',
  post_rest: 'observation_period',
  post_test_monitoring: 'monitoring_period',
  post_test_storage: 'post_storage',
};

export function canonicalKey(rawKey) {
  const k = String(rawKey).trim().toLowerCase();
  return ALIASES[k] || k;
}

/**
 * Label, category and priority for a condition key (raw or canonical).
 * Unknown keys fall back to a readable version of the key itself.
 */
export function getParameterMeta(rawKey) {
  const key = canonicalKey(rawKey);
  if (PARAMETER_DICTIONARY[key]) return PARAMETER_DICTIONARY[key];
  return {
    label: String(rawKey).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    category: 'other',
    priority: 99,
  };
}

/** Split a condition value ({ value, detail } or a bare string) into strings. */
export function splitConditionValue(raw) {
  if (raw == null) return { value: '', detail: '' };
  if (typeof raw === 'string' || typeof raw === 'number') return { value: String(raw), detail: '' };
  const value = raw.value == null ? '' : String(raw.value);
  const detail = raw.detail == null ? '' : String(raw.detail);
  return { value, detail };
}

/** Condition entries of one test, labelled and sorted for display. */
export function sortConditionEntries(conditionsObj) {
  if (!conditionsObj || typeof conditionsObj !== 'object') return [];
  return Object.entries(conditionsObj)
    .map(([rawKey, raw]) => {
      const meta = getParameterMeta(rawKey);
      return { rawKey, key: canonicalKey(rawKey), ...meta, ...splitConditionValue(raw) };
    })
    .sort((a, b) => a.priority - b.priority);
}
