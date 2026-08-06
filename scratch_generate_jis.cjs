const fs = require('fs');
const path = require('path');

const iecPath = path.join(__dirname, 'data/IEC62619.json');
const jisPath = path.join(__dirname, 'data/JISC8715-2.json');

const iecData = JSON.parse(fs.readFileSync(iecPath, 'utf8'));

// 1. Update Document Metadata
iecData.document.id = "JISC8715-2";
iecData.document.full_name = "JIS C 8715-2:2019 産業用リチウム二次電池の単電池及び電池システム－第２部：安全性要求事項";
iecData.document.full_name_zh = "產業用鋰二次電池之單電池及電池系統 – 第2部：安全性要求事項";
iecData.document.short_name = "JIS C 8715-2";
iecData.document.publisher = "JSA (Japanese Standards Association)";
iecData.document.publication_date = "2019";
iecData.document.scope = "本標準規定了包含鹼性或其他非酸性電解質的產業用鋰二次電池（單電池及電池系統）在通常使用及可預見誤用條件下的安全性要求事項。對應國際標準為 IEC 62619 (MOD)。";
iecData.document.source_pdf = "JISC8715-2_2019 産業用リチウム二次電池の単電池及び電池システム－第２部：安全性要求事.pdf";
iecData.document.source_gemini_md = "";

// 2. Update Terms sources
iecData.terms.forEach(term => {
  if (term.source) {
    term.source = term.source.replace("IEC 62619:2022", "JIS C 8715-2:2019");
  }
});

// 3. Update Tests
iecData.tests.forEach(test => {
  // Update ID and references
  test.id = test.id.replace("IEC62619", "JISC8715-2");
  if (test.source_reference) {
    test.source_reference = test.source_reference.replace("IEC 62619:2022", "JIS C 8715-2:2019");
  }
  if (test.original_text_snippet) {
    test.original_text_snippet = "";
  }
  
  if (test.related_tests) {
    test.related_tests = test.related_tests.map(rt => rt.replace("IEC62619", "JISC8715-2"));
  }

  // JIS Specific modifications (Annex JA)
  
  // 7.2.3 Drop Test
  if (test.id === "JISC8715-2-7.2.3") {
    if (test.conditions.mass_based_conditions) {
      test.conditions.mass_based_conditions.detail = test.conditions.mass_based_conditions.detail.replace(
        "7-20 kg 時以底部朝下方向跌落", 
        "7 kg以上之測試單元，依製造商指定之底面朝下進行跌落 (7 kg以上の試験対象に関して，製造業者が指定する底面を下にして試験を行う)"
      );
    }
    test.conditions.rest_time = {
      "value": "靜置 1 小時後外觀檢查",
      "detail": "測試後靜置至少 1 小時，然後進行外觀檢查 (試験後，試験対象を1時間以上放置し，外観検査を実施する)。"
    };
  }

  // 7.2.5 Overcharge Test
  if (test.id === "JISC8715-2-7.2.5") {
    if (test.conditions.charging_current) {
      test.conditions.charging_current.detail = test.conditions.charging_current.detail + " 若為並聯，充電電流為最大充電電流除以單電池之並聯數 (電池システム内で単電池が並列に接続されている場合の単電池の充電電流は，電池システムの最大の充電電流を単電池の並列数で除した値とした)。";
    }
  }

  // 7.2.6 Forced Discharge Test
  if (test.id === "JISC8715-2-7.2.6") {
    test.conditions.ambient_temperature = {
      "value": "25 ± 5 °C",
      "detail": "試驗在 25±5 ℃ 的周圍溫度下進行 (試験は25±5 ℃の周囲温度下で行う)。"
    };
    test.conditions.soc = {
      "value": "放電至終止電壓 (0.2 It A)",
      "detail": "單電池以 0.2 It A 的定電流放電至製造商指定的放電終止電壓 (単電池は，0.2 It Aの定電流で製造業者が指定する放電終止電圧まで放電する)。"
    };
  }

  // 7.3.2 Internal Short-Circuit Test
  if (test.id === "JISC8715-2-7.3.2") {
    if (test.acceptance_criteria) {
      test.acceptance_criteria.summary = "無起火";
      test.acceptance_criteria.details = ["無起火 (No fire)"];
    }
  }
  
  // 8.2.2 Overcharge Control of Voltage
  if (test.id === "JISC8715-2-8.2.2") {
    test.conditions.soc = {
      "value": "放電至終止電壓 (0.2 It A)",
      "detail": "電池系統以 0.2 It A 的定電流放電至單電池製造商指定的放電終止電壓 (0.2 It Aの定電流で，単電池の製造業者が指定する放電終止電圧まで放電する)。"
    };
  }
});

fs.writeFileSync(jisPath, JSON.stringify(iecData, null, 2));
console.log('JISC8715-2.json created successfully.');
