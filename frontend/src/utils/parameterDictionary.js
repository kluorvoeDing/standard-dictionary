// Dictionary mapping raw condition keys to Traditional Chinese labels, icons, and categories
export const PARAMETER_DICTIONARY = {
  // ── 電氣條件 ──
  soc: { label: '荷電狀態 (SOC)', icon: '🔋', category: 'electrical', priority: 1 },
  state_of_charge: { label: '荷電狀態 (SOC)', icon: '🔋', category: 'electrical', priority: 1 },
  voltage: { label: '試驗電壓', icon: '⚡', category: 'electrical', priority: 2 },
  charging_voltage: { label: '充電電壓', icon: '⚡', category: 'electrical', priority: 2 },
  test_voltage: { label: '試驗電壓', icon: '⚡', category: 'electrical', priority: 2 },
  supply_voltage: { label: '供電電壓', icon: '⚡', category: 'electrical', priority: 2 },
  final_voltage: { label: '終止電壓', icon: '⚡', category: 'electrical', priority: 2 },
  current: { label: '試驗電流', icon: '🔌', category: 'electrical', priority: 3 },
  charge_current: { label: '充電電流', icon: '🔌', category: 'electrical', priority: 3 },
  charging_current: { label: '充電電流', icon: '🔌', category: 'electrical', priority: 3 },
  discharge_current: { label: '放電電流', icon: '🔌', category: 'electrical', priority: 3 },
  resistance: { label: '外部短路電阻', icon: '⚡', category: 'electrical', priority: 4 },
  external_resistance: { label: '外部短路電阻', icon: '⚡', category: 'electrical', priority: 4 },
  short_circuit_resistance: { label: '短路電阻', icon: '⚡', category: 'electrical', priority: 4 },

  // ── 環境與溫度條件 ──
  temperature: { label: '環境溫度', icon: '🌡️', category: 'environmental', priority: 10 },
  ambient_temperature: { label: '環境溫度', icon: '🌡️', category: 'environmental', priority: 10 },
  test_temperature: { label: '試驗溫度', icon: '🌡️', category: 'environmental', priority: 10 },
  chamber_temperature: { label: '試驗箱溫度', icon: '🌡️', category: 'environmental', priority: 10 },
  high_temperature: { label: '高溫條件', icon: '🔥', category: 'environmental', priority: 11 },
  low_temperature: { label: '低溫條件', icon: '❄️', category: 'environmental', priority: 12 },
  heating_rate: { label: '升溫速率', icon: '📈', category: 'environmental', priority: 13 },
  humidity: { label: '相對濕度', icon: '💧', category: 'environmental', priority: 14 },
  altitude: { label: '模擬高度', icon: '⛰️', category: 'environmental', priority: 15 },
  pressure: { label: '環境氣壓', icon: '⏲️', category: 'environmental', priority: 16 },

  // ── 時間與持續時長 ──
  duration: { label: '維持時間', icon: '⏱️', category: 'timing', priority: 20 },
  test_duration: { label: '試驗時長', icon: '⏱️', category: 'timing', priority: 20 },
  time: { label: '持續時長', icon: '⏱️', category: 'timing', priority: 20 },
  hold_time: { label: '維持時間', icon: '⏱️', category: 'timing', priority: 20 },
  cycling_time: { label: '循環時長', icon: '⏱️', category: 'timing', priority: 21 },

  // ── 機械條件與治具 ──
  force: { label: '施加壓力 / 擠壓力', icon: '🔨', category: 'mechanical', priority: 30 },
  crush_force: { label: '擠壓力道', icon: '🔨', category: 'mechanical', priority: 30 },
  pressure_force: { label: '施加壓力', icon: '🔨', category: 'mechanical', priority: 30 },
  crush_speed: { label: '擠壓速度', icon: '⏩', category: 'mechanical', priority: 31 },
  drop_height: { label: '跌落高度', icon: '📐', category: 'mechanical', priority: 32 },
  drop_surface: { label: '跌落地面介質', icon: '🧱', category: 'mechanical', priority: 33 },
  impact_mass: { label: '衝擊重物質量', icon: '⚖️', category: 'mechanical', priority: 34 },
  impact_height: { label: '衝擊落錘高度', icon: '📐', category: 'mechanical', priority: 35 },
  impactor: { label: '衝擊壓頭規格', icon: '🔧', category: 'mechanical', priority: 36 },
  apparatus: { label: '治具與設備規格', icon: '🔧', category: 'mechanical', priority: 37 },
  steel_bar: { label: '鋼棒治具尺寸', icon: '🔧', category: 'mechanical', priority: 38 },
  needle_diameter: { label: '針刺直徑與材質', icon: '📍', category: 'mechanical', priority: 39 },
  needle_speed: { label: '針刺貫穿速度', icon: '⏩', category: 'mechanical', priority: 40 },
  vibration_frequency: { label: '振動頻率範圍', icon: '〰️', category: 'mechanical', priority: 41 },
  acceleration: { label: '加速度 / 衝擊量', icon: '🚀', category: 'mechanical', priority: 42 },

  // ── 實務四要素（樣品數、前置、觀察期、終止條件）──
  sample_quantity: { label: '樣品數量與狀態', icon: '📦', category: 'practical', priority: 50 },
  sample_size: { label: '樣品數量與狀態', icon: '📦', category: 'practical', priority: 50 },
  samples: { label: '樣品數量', icon: '📦', category: 'practical', priority: 50 },
  pre_conditioning: { label: '前置處理與循環', icon: '🔄', category: 'practical', priority: 51 },
  cycling: { label: '前置循環次數', icon: '🔄', category: 'practical', priority: 51 },
  observation: { label: '靜置與觀察時間', icon: '👀', category: 'practical', priority: 52 },
  observation_period: { label: '靜置與觀察時間', icon: '👀', category: 'practical', priority: 52 },
  rest_time: { label: '靜置與觀察時間', icon: '👀', category: 'practical', priority: 52 },
  rest_period: { label: '靜置與觀察時間', icon: '👀', category: 'practical', priority: 52 },
  monitoring_period: { label: '試驗後監控期', icon: '👀', category: 'practical', priority: 52 },
  termination: { label: '試驗終止條件', icon: '🛑', category: 'practical', priority: 53 },
  end_conditions: { label: '終止判定條件', icon: '🛑', category: 'practical', priority: 53 },
  stop_condition: { label: '停止條件', icon: '🛑', category: 'practical', priority: 53 },
  protective_device: { label: '保護裝置狀態', icon: '🛡️', category: 'practical', priority: 54 },
  fault_condition: { label: '單一故障設定', icon: '⚠️', category: 'practical', priority: 55 },
  applicability: { label: '適用對象與條件', icon: '📌', category: 'practical', priority: 56 }
};

/**
 * Get metadata for a condition key.
 * If key is not in dictionary, generates a readable label.
 */
export function getParameterMeta(rawKey) {
  const normalizedKey = String(rawKey).trim().toLowerCase();
  
  if (PARAMETER_DICTIONARY[normalizedKey]) {
    return PARAMETER_DICTIONARY[normalizedKey];
  }

  // Fallback: title-case the snake_case key
  const humanLabel = rawKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    label: humanLabel,
    icon: '•',
    category: 'other',
    priority: 99
  };
}

/**
 * Standardize and sort condition entries for clean side-by-side comparison
 */
export function sortConditionEntries(conditionsObj) {
  if (!conditionsObj || typeof conditionsObj !== 'object') return [];
  
  const entries = Object.entries(conditionsObj).map(([key, rawVal]) => {
    let value = '';
    let detail = '';
    if (typeof rawVal === 'string' || typeof rawVal === 'number') {
      value = String(rawVal);
    } else if (rawVal && typeof rawVal === 'object') {
      value = rawVal.value || '';
      detail = rawVal.detail || '';
    }
    const meta = getParameterMeta(key);
    return {
      rawKey: key,
      label: meta.label,
      icon: meta.icon,
      category: meta.category,
      priority: meta.priority,
      value,
      detail
    };
  });

  return entries.sort((a, b) => a.priority - b.priority);
}
