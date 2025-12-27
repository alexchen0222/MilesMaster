
import React, { useState, useEffect } from 'react';
import { SearchCriteria, TripType, FlightSegment } from '../types';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading: boolean;
}

// 常見機場資料庫
const AIRPORT_DATA = [
  // 台灣/港澳
  { code: 'TPE', city: 'Taipei', name: 'Taoyuan Intl' },
  { code: 'TSA', city: 'Taipei', name: 'Songshan' },
  { code: 'KHH', city: 'Kaohsiung', name: 'Kaohsiung Intl' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong Intl' },
  { code: 'MFM', city: 'Macau', name: 'Macau Intl' },
  // 日本
  { code: 'NRT', city: 'Tokyo', name: 'Narita' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda' },
  { code: 'KIX', city: 'Osaka', name: 'Kansai' },
  { code: 'ITM', city: 'Osaka', name: 'Itami' },
  { code: 'FUK', city: 'Fukuoka', name: 'Fukuoka' },
  { code: 'CTS', city: 'Sapporo', name: 'New Chitose' },
  { code: 'OKA', city: 'Okinawa', name: 'Naha' },
  // 韓國
  { code: 'ICN', city: 'Seoul', name: 'Incheon' },
  { code: 'GMP', city: 'Seoul', name: 'Gimpo' },
  { code: 'PUS', city: 'Busan', name: 'Gimhae' },
  // 東南亞
  { code: 'SIN', city: 'Singapore', name: 'Changi' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
  { code: 'DMK', city: 'Bangkok', name: 'Don Mueang' },
  { code: 'SGN', city: 'Ho Chi Minh', name: 'Tan Son Nhat' },
  { code: 'HAN', city: 'Hanoi', name: 'Noi Bai' },
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur Intl' },
  { code: 'DPS', city: 'Bali', name: 'Ngurah Rai' },
  // 北美
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles Intl' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco Intl' },
  { code: 'SEA', city: 'Seattle', name: 'Tacoma' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy' },
  { code: 'EWR', city: 'New York', name: 'Newark Liberty' },
  { code: 'ORD', city: 'Chicago', name: 'O\'Hare' },
  { code: 'IAH', city: 'Houston', name: 'George Bush' },
  { code: 'DFW', city: 'Dallas', name: 'Fort Worth' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver Intl' },
  { code: 'YYZ', city: 'Toronto', name: 'Pearson' },
  { code: 'CUN', city: 'Cancun', name: 'Cancun Intl' },
  // 歐洲/中東/紐澳
  { code: 'LHR', city: 'London', name: 'Heathrow' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt' },
  { code: 'MUC', city: 'Munich', name: 'Munich' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna Intl' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai Intl' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith' },
  { code: 'MEL', city: 'Melbourne', name: 'Tullamarine' },
];

const MILEAGE_PROGRAMS = [
  { name: 'All', label: '所有計畫 (智能優選)', alliance: 'Global' },
  { name: 'EVA Infinity', label: 'EVA Air (BR)', alliance: 'Star Alliance' },
  { name: 'CAL Dynasty', label: 'China Airlines (CI)', alliance: 'SkyTeam' },
  { name: 'Starlux COSMILE', label: 'Starlux (JX)', alliance: 'Partner' },
  { name: 'Air Canada Aeroplan', label: 'Aeroplan (AC)', alliance: 'Star Alliance' },
  { name: 'Alaska Mileage Plan', label: 'Alaska (AS)', alliance: 'Oneworld' },
  { name: 'United MileagePlus', label: 'United (UA)', alliance: 'Star Alliance' },
  { name: 'British Airways Avios', label: 'BA Avios', alliance: 'Oneworld' },
  { name: 'Avianca LifeMiles', label: 'LifeMiles (AV)', alliance: 'Star Alliance' },
  { name: 'ANA Mileage Club', label: 'ANA (NH)', alliance: 'Star Alliance' },
  { name: 'Cathay Asia Miles', label: 'Asia Miles (CX)', alliance: 'Oneworld' },
  { name: 'Flying Blue', label: 'Flying Blue (AF/KL)', alliance: 'SkyTeam' },
];

// 機場輸入元件
interface AirportInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
}

const AirportAutocomplete: React.FC<AirportInputProps> = ({ label, value, onChange, placeholder, className }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(AIRPORT_DATA);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    onChange(val);
    
    if (val.length > 0) {
      const filtered = AIRPORT_DATA.filter(a => 
        a.code.includes(val) || 
        a.city.toUpperCase().includes(val) ||
        a.name.toUpperCase().includes(val)
      );
      // 排序優化：完全匹配代碼的放最前面
      filtered.sort((a, b) => {
        if (a.code === val) return -1;
        if (b.code === val) return 1;
        return 0;
      });
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative flex flex-col ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={handleInput}
        onFocus={() => { if(value) setShowSuggestions(true); }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="bg-transparent font-black text-xl text-slate-800 outline-none placeholder:text-slate-300 w-full"
        required
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-[100%] left-0 w-full min-w-[200px] bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-50 mt-2 animate-fadeIn">
           {suggestions.map((airport) => (
             <div 
               key={airport.code}
               className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group border-b border-slate-50 last:border-0"
               onMouseDown={(e) => {
                 e.preventDefault(); // 防止 input blur
                 onChange(airport.code);
                 setShowSuggestions(false);
               }}
             >
                <div className="flex flex-col text-left">
                   <div className="flex items-center gap-2">
                       <span className="font-black text-slate-800 text-sm w-9">{airport.code}</span>
                       <span className="text-xs font-bold text-slate-600">{airport.city}</span>
                   </div>
                   <span className="text-[10px] text-slate-400 font-medium pl-11">{airport.name}</span>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const getToday = () => new Date().toISOString().split('T')[0];
  
  const [tripType, setTripType] = useState<TripType>('OneWay');
  const [segments, setSegments] = useState<FlightSegment[]>([
    { origin: 'TPE', destination: 'SFO', date: getToday() }
  ]);
  const [returnDate, setReturnDate] = useState(getToday());
  const [cabin, setCabin] = useState('Business');
  const [passengers, setPassengers] = useState(1);
  const [preferredProgram, setPreferredProgram] = useState('All');
  const [isStrictProgram, setIsStrictProgram] = useState(false);
  const [searchRange, setSearchRange] = useState(0); // Default exact date

  useEffect(() => {
    if (preferredProgram === 'All') {
      setIsStrictProgram(false);
    }
  }, [preferredProgram]);

  const handleAddSegment = () => {
    if (segments.length < 4) {
      const lastSegment = segments[segments.length - 1];
      setSegments([...segments, { origin: lastSegment.destination, destination: '', date: getToday() }]);
    }
  };

  const handleRemoveSegment = (index: number) => {
    if (segments.length > 1) {
      const newSegments = segments.filter((_, i) => i !== index);
      setSegments(newSegments);
    }
  };

  const updateSegment = (index: number, field: keyof FlightSegment, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  const handleSwap = (index: number) => {
    const newSegments = [...segments];
    const { origin, destination } = newSegments[index];
    newSegments[index] = { ...newSegments[index], origin: destination, destination: origin };
    setSegments(newSegments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ 
      tripType, 
      segments, 
      returnDate: tripType === 'RoundTrip' ? returnDate : undefined, 
      cabin, 
      passengers, 
      preferredProgram,
      isStrictProgram,
      searchRange 
    });
  };

  const toggleStrict = () => {
     if (preferredProgram !== 'All') {
         setIsStrictProgram(!isStrictProgram);
     }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 md:p-8 -mt-24 relative z-10 border border-slate-100">
      {/* Trip Type Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
          {(['OneWay', 'RoundTrip', 'MultiCity'] as TripType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTripType(type)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                tripType === type ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {type === 'OneWay' && '單程'}
              {type === 'RoundTrip' && '來回'}
              {type === 'MultiCity' && '多航點'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100/50">
           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">熱門預設:</span>
           <button type="button" onClick={() => { setSegments([{ origin: 'TPE', destination: 'NRT', date: getToday() }]); setCabin('Business'); }} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">TPE-NRT</button>
           <span className="text-blue-200">|</span>
           <button type="button" onClick={() => { setSegments([{ origin: 'LAX', destination: 'TPE', date: getToday() }]); setCabin('Business'); }} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">LAX-TPE</button>
           <span className="text-blue-200">|</span>
           <button type="button" onClick={() => { setSegments([{ origin: 'LAX', destination: 'CUN', date: getToday() }]); setCabin('Economy'); }} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">LAX-CUN</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dynamic Segments */}
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-0 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
                
                {/* Origin Autocomplete */}
                <AirportAutocomplete
                   label="出發地"
                   value={segment.origin}
                   onChange={(val) => updateSegment(index, 'origin', val)}
                   placeholder="TPE"
                   className="flex-1 lg:border-r border-slate-200 px-4 py-2"
                />

                {/* Swap Button */}
                <div className="flex items-center justify-center -my-3 lg:my-0 relative z-20">
                   <button 
                     type="button" 
                     onClick={() => handleSwap(index)}
                     className="bg-white border border-slate-200 p-2 rounded-full text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all shadow-sm group"
                     title="交換航點"
                   >
                     <svg className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                     </svg>
                   </button>
                </div>

                {/* Destination Autocomplete */}
                <AirportAutocomplete
                   label="目的地"
                   value={segment.destination}
                   onChange={(val) => updateSegment(index, 'destination', val)}
                   placeholder="SFO"
                   className="flex-1 lg:border-r border-slate-200 lg:pl-6 px-4 py-2"
                />

                {/* Date */}
                <div className="flex-1 flex flex-col px-4 py-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">出發日期</label>
                  <input 
                    type="date" 
                    value={segment.date}
                    onChange={(e) => updateSegment(index, 'date', e.target.value)}
                    className="bg-transparent font-black text-xl text-slate-800 outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {tripType === 'MultiCity' && segments.length > 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveSegment(index)}
                  className="absolute -right-2 -top-2 h-6 w-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors z-20"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          ))}

          {tripType === 'MultiCity' && segments.length < 4 && (
            <button 
              type="button"
              onClick={handleAddSegment}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>+ 增加下一段航程</span>
            </button>
          )}

          {tripType === 'RoundTrip' && (
            <div className="flex flex-col px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">回程日期</label>
              <input 
                type="date" 
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="bg-transparent font-black text-xl text-slate-800 outline-none"
                required
              />
            </div>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
             <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex flex-col justify-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">艙等</label>
                <select 
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value)}
                  className="bg-transparent font-black text-slate-800 outline-none appearance-none"
                >
                  <option value="Economy">經濟艙</option>
                  <option value="Premium Economy">豪經艙</option>
                  <option value="Business">商務艙</option>
                  <option value="First">頭等艙</option>
                </select>
             </div>

             <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex flex-col justify-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">日期彈性</label>
                <select 
                  value={searchRange}
                  onChange={(e) => setSearchRange(Number(e.target.value))}
                  className="bg-transparent font-black text-slate-800 outline-none appearance-none"
                >
                   <option value={0}>當天 (Exact)</option>
                   <option value={1}>前後 1 天 (±1 Day)</option>
                   <option value={3}>前後 3 天 (±3 Days)</option>
                   <option value={7}>前後 7 天 (±7 Days)</option>
                   <option value={15}>前後 15 天 (±15 Days)</option>
                   <option value={30}>前後 30 天 (±30 Days)</option>
                </select>
             </div>

             <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex flex-col justify-center relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">計畫偏好</label>
                  
                  {/* Toggle Switch */}
                  <div 
                    onClick={toggleStrict}
                    className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${preferredProgram === 'All' ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                    title={preferredProgram === 'All' ? "請先選擇特定計畫" : "開啟後將只搜尋此計畫，不顯示其他結果"}
                  >
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${isStrictProgram ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isStrictProgram ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className={`text-[10px] font-bold ${isStrictProgram ? 'text-blue-600' : 'text-slate-400'}`}>僅搜尋此計畫</span>
                  </div>
                </div>
                
                <select 
                  value={preferredProgram}
                  onChange={(e) => setPreferredProgram(e.target.value)}
                  className="bg-transparent font-black text-slate-800 outline-none appearance-none truncate pr-4 w-full"
                >
                  {MILEAGE_PROGRAMS.map(p => <option key={p.name} value={p.name}>{p.label}</option>)}
                </select>
             </div>

             <div className="md:col-span-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-full min-h-[60px] bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-lg ${isLoading ? 'opacity-80 cursor-wait' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 text-base">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </>
                  )}
                </button>
             </div>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
