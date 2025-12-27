
import React from 'react';
import { FlightAward, CabinOption } from '../types';

interface FlightCardProps {
  award: FlightAward;
}

const FlightCard: React.FC<FlightCardProps> = ({ award }) => {
  const isHighRiskProgram = ['alaska', 'aeroplan', 'air canada', 'lifemiles'].some(p => award.program.toLowerCase().includes(p));
  const isPartner = award.awardType === 'Partner';

  const getProgramColor = (program: string) => {
    const p = program.toLowerCase();
    if (p.includes('aeroplan')) return 'bg-[#eb192e]';
    if (p.includes('united')) return 'bg-[#005da4]';
    if (p.includes('alaska')) return 'bg-[#00426a]';
    if (p.includes('ana')) return 'bg-[#13286f]';
    if (p.includes('eva')) return 'bg-[#00703c]';
    if (p.includes('cathay') || p.includes('asia')) return 'bg-[#006064]';
    if (p.includes('starlux')) return 'bg-[#b4975a]';
    if (p.includes('china') || p.includes('dynasty')) return 'bg-[#da291c]';
    if (p.includes('japan') || p.includes('jal')) return 'bg-[#cc0000]';
    return 'bg-slate-800';
  };

  const getCabinColor = (cls: string) => {
      switch(cls) {
          case 'Economy': return 'bg-slate-100 text-slate-600';
          case 'Premium Economy': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
          case 'Business': return 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-100';
          case 'First': return 'bg-purple-50 text-purple-800 border-purple-200 ring-1 ring-purple-100';
          default: return 'bg-slate-50';
      }
  };

  const getAvailabilityStyle = (availability: string) => {
      switch(availability) {
          case 'High': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
          case 'Low': return 'text-amber-600 bg-amber-50 border-amber-200';
          case 'Waitlist': return 'text-slate-500 bg-slate-100 border-slate-200 opacity-70';
          case 'None': return 'text-slate-300 bg-slate-50 border-slate-100 opacity-40';
          default: return 'text-slate-600';
      }
  };

  const formatDate = (dateStr: string) => {
      try {
          const d = new Date(dateStr);
          return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' });
      } catch (e) {
          return dateStr;
      }
  };

  // 格式化哩程數 (例如 35000 -> 35k)
  const formatMiles = (miles: number) => {
      if (miles >= 10000) return `${(miles / 1000).toFixed(1).replace('.0', '')}k`;
      return miles.toLocaleString();
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-0 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col`}>
      
      {/* Header Bar */}
      <div className={`px-6 py-3 flex justify-between items-center ${isHighRiskProgram ? 'bg-amber-50/50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
                {formatDate(award.date)}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                {isPartner ? 'Partner Award' : 'Own Metal'}
            </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider ${getProgramColor(award.program)}`}>
            {award.program}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
             {/* Flight Route */}
             <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                 <div>
                    <div className="text-3xl font-black text-slate-800">{award.origin}</div>
                    <div className="text-xs font-bold text-blue-600 mt-1">{award.departureTime}</div>
                 </div>
                 
                 <div className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{award.duration}</div>
                    <div className="w-full h-0.5 bg-slate-200 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                             <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1">{award.airline} {award.flightNumber}</div>
                 </div>

                 <div className="text-right">
                    <div className="text-3xl font-black text-slate-800">{award.destination}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">{award.arrivalTime}</div>
                 </div>
             </div>
          </div>

          {/* Cabin Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Economy', 'Premium Economy', 'Business', 'First'].map((cabinType) => {
                  const option = award.cabinOptions.find(c => c.cabinClass === cabinType) || {
                      cabinClass: cabinType, milesRequired: 0, availability: 'None', status: 'N/A', remainingSeats: 0
                  } as CabinOption;

                  const hasTiers = option.pricingTiers && option.pricingTiers.length > 1;

                  return (
                    <div 
                        key={cabinType} 
                        className={`flex flex-col items-center p-3 rounded-xl border transition-all relative ${
                            option.availability !== 'None' ? 'border-slate-200 hover:border-blue-300 cursor-pointer' : 'border-slate-100 bg-slate-50/50'
                        } ${getCabinColor(cabinType)}`}
                    >
                        {/* Remaining Seats Badge */}
                        {option.availability !== 'None' && option.remainingSeats > 0 && option.status !== 'Waitlist' && (
                             <div className={`absolute -top-2 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border ${option.remainingSeats < 2 ? 'bg-rose-500 text-white border-rose-600' : 'bg-emerald-500 text-white border-emerald-600'}`}>
                                 {option.remainingSeats >= 9 ? '9+ left' : `${option.remainingSeats} left`}
                             </div>
                        )}

                        <span className="text-[10px] font-black uppercase mb-1 opacity-60 text-center leading-tight h-5 flex items-center">{cabinType === 'Premium Economy' ? 'Prem. Eco' : cabinType}</span>
                        
                        {option.availability !== 'None' ? (
                            <div className="flex flex-col items-center w-full">
                                <span className="text-lg font-black">{formatMiles(option.milesRequired)}</span>
                                
                                {hasTiers ? (
                                   <div className="flex flex-col items-center mt-1 w-full gap-1">
                                      <div className="text-[9px] font-bold text-slate-500 bg-white/50 px-1 rounded whitespace-nowrap">
                                         Next: {formatMiles(option.pricingTiers![1].milesPerSeat)}
                                      </div>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getAvailabilityStyle(option.availability)}`}>
                                        {option.status === 'Waitlist' ? '候補' : '階梯價'}
                                      </span>
                                   </div>
                                ) : (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border mt-2 ${getAvailabilityStyle(option.availability)}`}>
                                        {option.status === 'Waitlist' ? '候補' : 'Available'}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-slate-300 mt-1">-</span>
                        )}
                    </div>
                  );
              })}
          </div>

          {/* Footer Info */}
          <div className="flex flex-col gap-2 mt-2 border-t border-slate-100 pt-4">
              {award.bookingNotes && (
                  <div className="text-[10px] font-medium text-slate-500 bg-slate-50 p-2 rounded-lg">
                      💡 {award.bookingNotes}
                  </div>
              )}
              <div className="flex justify-between items-center">
                   <div className="text-xs font-bold text-slate-400">
                       稅金預估: <span className="text-slate-600">{award.taxesAndFees}</span>
                   </div>
                   <a 
                    href={award.bookingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                  >
                    前往官網
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </a>
              </div>
          </div>
      </div>
    </div>
  );
};

export default FlightCard;
