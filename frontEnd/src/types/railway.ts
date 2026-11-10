export type SeatClass = 'SNIGDHA' | 'S_CHAIR' | 'SHOVAN' | 'AC_B' | 'AC_S' | 'F_BERTH' | 'SHOVAN_CHAIR';

export interface Station {
  code: string;
  name: string;
  nameBn: string;
  division: 'DHAKA' | 'CHATTOGRAM' | 'RAJSHAHI' | 'SYLHET' | 'KHULNA' | 'RANGPUR' | 'MYMENSINGH';
  hub: boolean;
  platforms?: number;
  latitude?: number;
  longitude?: number;
}

export interface StationHalt {
  stationCode: string;
  stationName: string;
  stationNameBn: string;
  arrivalTime: string; // e.g. "07:15" or "--" for origin
  departureTime: string; // e.g. "07:20" or "--" for terminus
  haltDurationMinutes: number; // 0 for origin/terminus
  distanceKm: number;
  platform: string;
  status?: 'passed' | 'active' | 'upcoming';
}

export interface SeatAvailability {
  seatClass: SeatClass;
  availableSeats: number;
  fare: number;
  status: 'available' | 'rac' | 'waitlist' | 'sold_out';
}

export interface Train {
  trainNumber: string;
  trainName: string;
  trainNameBn: string;
  originStationCode: string;
  destinationStationCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  offDays: string[];
  totalDistanceKm: number;
  routeType: 'Broad Gauge' | 'Meter Gauge' | 'Dual Gauge';
  availableClasses: SeatClass[];
  halts: StationHalt[];
  liveStatus: {
    state: 'ON_TIME' | 'DELAYED' | 'ARRIVED' | 'SCHEDULED' | 'CANCELLED';
    delayMinutes: number;
    currentStationCode?: string;
    nextStationCode?: string;
    lastUpdated: string;
    platform?: string;
  };
}

export interface FareBreakdown {
  seatClass: SeatClass;
  className: string;
  classNameBn: string;
  baseFare: number;
  vatRate: number; // e.g. 0.15 for 15%
  vatAmount: number;
  serviceCharge: number; // ৳ 50 standard issuance fee
  totalFare: number;
  availableSeats: number;
}

export interface TransitCorridor {
  id: string;
  label: string;
  labelBn: string;
  originCode: string;
  destinationCode: string;
  distanceKm: number;
  avgDuration: string;
  frequency: string;
}

export interface TicketSummary {
  ticketNumber: string;
  trainNumber: string;
  trainName: string;
  fromStation: string;
  fromStationBn: string;
  toStation: string;
  toStationBn: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  seatClass: SeatClass;
  coach: string;
  seatNumber: string;
  platform: string;
  passengerName: string;
  fare: number;
  bookingStatus: 'CONFIRMED' | 'RAC' | 'WAITLIST';
}
