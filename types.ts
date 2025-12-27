
export type TripType = 'OneWay' | 'RoundTrip' | 'MultiCity';

export interface FlightSegment {
  origin: string;
  destination: string;
  date: string;
}

export interface PricingTier {
  quantity: number; // e.g. 1 seat
  milesPerSeat: number; // at 35000 miles
  tierName?: string; // e.g. "Saver", "Standard", "Advantage"
}

export interface CabinOption {
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  milesRequired: number; // The lowest available price per seat
  pricingTiers?: PricingTier[]; // Detailed pricing structure if mixed
  availability: 'High' | 'Low' | 'Waitlist' | 'None';
  status: string; // e.g. "Available", "Waitlist", "Not Available"
  remainingSeats: number; // Number of seats left at the lowest price, or total available
}

export interface FlightAward {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: string; 
  duration: string;
  program: string;
  taxesAndFees: string;
  cabinOptions: CabinOption[]; 
  bookingLink?: string;
  awardType: 'Own' | 'Partner';
  bookingNotes?: string;
  dataSource?: string; 
}

export interface SearchCriteria {
  tripType: TripType;
  segments: FlightSegment[];
  returnDate?: string;
  cabin: string;
  passengers: number;
  preferredProgram?: string;
  isStrictProgram?: boolean;
  searchRange: number; 
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  awards: FlightAward[];
  sources: GroundingSource[];
  summary: string;
}
