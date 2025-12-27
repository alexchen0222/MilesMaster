
import React, { useState, useCallback } from 'react';
import SearchForm from './components/SearchForm';
import FlightCard from './components/FlightCard';
import { searchAwardFlights } from './services/geminiService';
import { SearchCriteria, SearchResult } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (criteria: SearchCriteria) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await searchAwardFlights(criteria);
      setResults(data);
    } catch (err: any) {
      setError("搜尋過程發生錯誤。建議重新輸入正確的機場代碼（如 TPE, TYO, SFO）。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Header */}
      <header className="bg-slate-900 text-white pt-16 pb-40 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Powered by Gemini 3 Pro
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MilesMaster</h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            新一代 AI 哩程審計系統。<br/>具備邏輯推理能力，為您精確排除幻影機位。
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        <SearchForm onSearch={handleSearch} isLoading={loading} />

        {/* Verification Guide */}
        {!results && !loading && (
          <div className="mt-16 text-center opacity-60">
             <p className="text-sm font-bold text-slate-400">請輸入航程開始搜尋，AI 將會為您自動驗證機位真實性。</p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-center font-bold shadow-sm animate-shake">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-16 text-center animate-fadeIn">
            <div className="flex justify-center mb-8">
                 <div className="relative">
                    <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                       <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                 </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Gemini 3 Pro 正在思考與驗證...</h3>
            <div className="max-w-md mx-auto space-y-2">
               <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-2/3 animate-[progress_2s_ease-in-out_infinite]"></div>
               </div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">正在交叉比對執飛航空庫存</p>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-16 animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Results List */}
              <div className="lg:w-2/3 space-y-6">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI 精選結果</h2>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        已過濾 {results.awards.length > 0 ? '無效候補' : '無位航班'}
                    </span>
                </div>

                {results.awards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {results.awards.map((award, index) => (
                            <FlightCard key={index} award={award} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                        <div className="text-4xl mb-4">🕵️</div>
                        <p className="font-black text-lg text-slate-700 mb-2">未發現符合條件的確認機位</p>
                        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">AI 已過濾掉所有候補名單與疑似幻影位。建議您嘗試更換日期或選擇其他航點。</p>
                    </div>
                )}
                
                {/* AI Analysis */}
                <div className="mt-12 bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    <h3 className="text-xl font-black text-slate-800 mb-4 relative z-10">
                        哩程策略報告
                    </h3>
                    <div className="prose prose-sm prose-slate max-w-none font-medium leading-relaxed whitespace-pre-wrap relative z-10">
                        {results.summary}
                    </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/3 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-8">
                    <h3 className="font-black text-slate-800 mb-6 text-lg">快速驗證通道</h3>
                    <div className="space-y-2">
                        {[
                            { name: "Air Canada (AC)", url: "https://www.aircanada.com/ca/en/aco/home/aeroplan.html" },
                            { name: "United (UA)", url: "https://www.united.com/en/us/book-flight/united-miles" },
                            { name: "Alaska (AS)", url: "https://www.alaskaair.com/search/results" },
                            { name: "ANA (NH)", url: "https://www.ana.co.jp/zh/tw/amc/reference/tukau/award/int/usage.html" }
                        ].map((link, i) => (
                            <a key={i} href={link.url} target="_blank" className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">{link.name}</span>
                                <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </a>
                        ))}
                    </div>

                    <div className="mt-6 p-5 bg-rose-50 rounded-2xl border border-rose-100">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-lg">🛡️</span>
                           <span className="text-xs font-black text-rose-800 uppercase">防詐騙提醒</span>
                        </div>
                        <p className="text-[10px] font-bold text-rose-700/80 leading-relaxed">
                            請注意：若搜尋結果為 "Partner" 票種，請務必在轉點前至該航空官網確認能看到相同票位，避免因系統快取落差導致點數卡住。
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-12 mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-slate-900 font-black text-2xl italic mb-2">MilesMaster</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Powered by Google Gemini 3 Pro</div>
          <p className="text-slate-400 text-xs font-medium max-w-lg mx-auto leading-relaxed">
            搜尋結果僅供參考。哩程機位庫存變動極快，實際可兌換機位以各航空公司官網即時數據為準。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
