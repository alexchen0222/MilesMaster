
import { GoogleGenAI } from "@google/genai";
import { SearchCriteria, SearchResult, FlightAward } from "../types";

// Helper to calculate date range
const getDateRange = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  const start = new Date(date);
  start.setDate(date.getDate() - days);
  const end = new Date(date);
  end.setDate(date.getDate() + days);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

export const searchAwardFlights = async (criteria: SearchCriteria): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let dateInstruction = "";
  const rangeDays = criteria.searchRange || 0;
  
  const segmentsStr = criteria.segments.map((s, i) => {
    let rangeInfo = "";
    if (rangeDays > 0) {
      const { start, end } = getDateRange(s.date, rangeDays);
      rangeInfo = ` (搜尋範圍擴大：${start} 至 ${end})`;
      dateInstruction = `【日期擴展模式】：使用者指定了前後 ${rangeDays} 天 (共 ${rangeDays * 2} 天) 的範圍。請搜尋並列出該區間內「有位」的航班。`;
    } else {
        dateInstruction = `【日期模式】：精確日期搜尋 (Exact Date)。`;
    }
    return `航段 ${i+1}: ${s.origin} 至 ${s.destination} (目標日期: ${s.date}${rangeInfo})`;
  }).join('\n');

  // 建構計畫搜尋指令
  let programInstruction = "";
  if (criteria.preferredProgram && criteria.preferredProgram !== 'All') {
    if (criteria.isStrictProgram) {
      programInstruction = `【嚴格限制 (STRICT MODE)】：僅允許搜尋「${criteria.preferredProgram}」。絕對禁止列出其他計畫的結果。`;
    } else {
      programInstruction = `【優先搜尋】：請優先專注於 ${criteria.preferredProgram}，但也請列出其他聯盟的優質選項。`;
    }
  } else {
    programInstruction = '請搜尋所有主流計畫 (Star Alliance, Oneworld, SkyTeam, Starlux COSMILE)。';
  }

  const prompt = `你現在是搭載 Gemini 3 Pro 核心的航空哩程精算師。
  
  【任務目標】：搜尋並比對哩程機位。使用者特別關注 **JX800, JX804, JX872 (Starlux)** 以及 **JL802, JL809 (Japan Airlines)**。即使其他搜尋引擎顯示無位，請務必透過 Search Tool 深度挖掘這些特定航班的即時庫存。

  【搜尋請求詳情】：
  ${segmentsStr}
  ${dateInstruction}
  旅客預計人數：${criteria.passengers} 人
  旅程類型：${criteria.tripType}

  【關鍵計價規則 - 動態計價 (Dynamic Pricing & Tiers)】：
  航空公司常採用階梯式計價。若查詢 ${criteria.passengers} 人，但 Saver (低價票) 庫存不足，剩餘座位會變成 Standard/Advantage (高價票)。
  **請務必在 \`pricingTiers\` 欄位中反映此狀況**。
  
  範例情境 (查詢 2 人)：
  - 第 1 張票：Saver (35,000 miles)
  - 第 2 張票：Standard (55,000 miles)
  - 輸出結構：\`pricingTiers: [{quantity: 1, milesPerSeat: 35000, tierName: "Saver"}, {quantity: 1, milesPerSeat: 55000, tierName: "Standard"}]\`
  - \`milesRequired\` 填寫最低價 (35000)，並將 \`status\` 設為 "Tiered/Mixed"。

  【必查艙等 (Mandatory Cabins)】：
  請務必檢查並回傳以下四種艙等，缺一不可：
  1. **Economy (經濟艙)**
  2. **Premium Economy (豪經艙)** - 請特別注意長榮 (BR), 華航 (CI), 日航 (JL), 星宇 (JX) 的豪經艙。
  3. **Business (商務艙)**
  4. **First (頭等艙)**

  【驗證與搜尋邏輯】：
  1. **JX (星宇) & JL (日航) 優先**：請優先確認這些航班的商務艙與豪經艙狀況。
  2. **精確剩餘座位**：請找出具體的 "Seats Left"。若網站顯示 "Only 1 left at this price"，請精確填入 \`remainingSeats\`。
  3. **自家 vs 夥伴**：請區分是用自家計畫 (如 JX COSMILE 換 JX) 還是夥伴計畫 (如 AS 換 JX)。

  【計畫搜尋範圍】：${programInstruction}

  【輸出規定】：
  請提供 JSON 格式。

  \`\`\`json
  [
    {
      "airline": "JX",
      "flightNumber": "JX800",
      "origin": "TPE",
      "destination": "NRT",
      "date": "YYYY-MM-DD",
      "departureTime": "08:30",
      "arrivalTime": "12:30",
      "duration": "3h 00m",
      "program": "Starlux COSMILE", 
      "taxesAndFees": "NT$ 2,500",
      "awardType": "Own",
      "bookingLink": "https://www.starlux-airlines.com",
      "bookingNotes": "自家計畫庫存充足，豪經艙與商務艙皆有位。",
      "cabinOptions": [
         {
           "cabinClass": "Premium Economy",
           "milesRequired": 40000,
           "availability": "High",
           "status": "Available",
           "remainingSeats": 4
         },
         {
           "cabinClass": "Business",
           "milesRequired": 55000,
           "availability": "Low", 
           "status": "Tiered/Mixed",
           "remainingSeats": 1,
           "pricingTiers": [
              { "quantity": 1, "milesPerSeat": 55000, "tierName": "Saver" },
              { "quantity": 1, "milesPerSeat": 70000, "tierName": "Standard" }
           ]
         }
      ]
    }
  ]
  \`\`\`
  
  現在，請利用 googleSearch 搜尋 "${criteria.segments[0].origin} to ${criteria.segments[0].destination} flight award availability ${criteria.segments[0].date} Starlux JX Japan Airlines JL premium economy business class seats left"，並根據以上動態計價規則產生結果。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4096 },
      },
    });

    const text = response.text || "未能搜尋到結果。";
    
    let awards: FlightAward[] = [];
    const jsonMatch = text.match(/```json\s+([\s\S]*?)\s+```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed)) {
          // 二次過濾
          awards = parsed.filter(a => {
             const hasAvailability = a.cabinOptions.some((opt: any) => opt.availability !== 'None');
             if (!hasAvailability) return false;

             const requestedOrigin = criteria.segments[0].origin.toUpperCase();
             const requestedDest = criteria.segments[0].destination.toUpperCase();
             const resultOrigin = a.origin.toUpperCase();
             const resultDest = a.destination.toUpperCase();
             
             if (criteria.tripType === 'OneWay') {
                return resultOrigin === requestedOrigin && resultDest === requestedDest;
             }
             return true; 
          });
          
          if (criteria.preferredProgram && criteria.isStrictProgram && criteria.preferredProgram !== 'All') {
            const targetProgram = criteria.preferredProgram.toLowerCase().split(' ')[0];
            awards = awards.filter(a => a.program.toLowerCase().includes(targetProgram.toLowerCase()) || 
                                        criteria.preferredProgram?.toLowerCase().includes(a.program.toLowerCase()));
            
            // 按照日期排序
            awards.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          }
        }
      } catch (e) {
        console.error("JSON 解析失敗", e);
      }
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return {
      awards: awards,
      sources,
      summary: text.replace(/```json\s+([\s\S]*?)\s+```/, "").trim()
    };
  } catch (error) {
    console.error("Gemini API 錯誤:", error);
    throw error;
  }
};
