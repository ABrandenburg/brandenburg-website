// ServiceTitan Scorecard Types

// Technician base data from ServiceTitan
export interface Technician {
  id: number;
  name: string;
  active: boolean;
}

// Technician KPIs (raw data from ServiceTitan reports)
export interface TechnicianKPIs {
  id: string; // slugified name
  name: string;
  opportunityJobAverage: number;
  totalRevenueCompleted: number;
  optionsPerOpportunity: number;
  closeRate: number; // percentage
  membershipsSold: number;
  membershipConversionRate: number; // percentage
  leads: number;
  leadsBooked: number;
  hoursSold: number;
}

// Ranked technician (with trends and formatted values)
export interface RankedTechnician {
  id: string;
  name: string;
  value: number;
  formattedValue: string;
  trend: number; // % change from previous period
  rank: number;
  previousValue?: number;
  previousRank?: number;
}

// Company-wide leads summary
export interface LeadsSummary {
  totalLeads: number;
  bookedLeads: number;
  bookingRate: number; // percentage
  previousTotalLeads?: number;
  previousBookedLeads?: number;
  previousBookingRate?: number;
}

// Company-wide overall stats
export interface OverallStats {
  opportunityJobAverage: number;
  opportunityCloseRate: number;
  totalCloseRate: number;
  optionsPerOpportunity: number;
  totalRevenue: number;
  cancelledJobs: number;
  // Previous period values for trends
  previousOpportunityJobAverage?: number;
  previousOpportunityCloseRate?: number;
  previousTotalCloseRate?: number;
  previousOptionsPerOpportunity?: number;
  previousTotalRevenue?: number;
  previousCancelledJobs?: number;
}

// Full rankings response from API
export interface RankedKPIs {
  opportunityJobAverage: RankedTechnician[];
  totalRevenueCompleted: RankedTechnician[];
  optionsPerOpportunity: RankedTechnician[];
  closeRate: RankedTechnician[];
  membershipsSold: RankedTechnician[];
  membershipConversionRate: RankedTechnician[];
  hoursSold: RankedTechnician[];
  leads: RankedTechnician[];
  leadsBooked: RankedTechnician[];
  leadsSummary?: LeadsSummary;
  overallStats?: OverallStats;
  dateRange: {
    startDate: string; // YYYY-MM-DD
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
  hasPreviousPeriodData: boolean;
}

// Goal configuration for ranking cards
export interface GoalConfig {
  value: number;
  formatValue: (value: number) => string;
  label?: string;
}

// Cache TTL constants (in seconds) - default values
export const CACHE_TTL = {
  CURRENT_PERIOD: 120 * 60,      // 2 hours
  PREVIOUS_PERIOD: 24 * 60 * 60, // 24 hours
  RANKINGS: 120 * 60,            // 2 hours
  TECHNICIAN: 120 * 60,          // 2 hours
} as const;

// Period-specific cache TTLs (in seconds)
// Longer periods have longer TTLs since data changes less frequently
export const CACHE_TTL_BY_PERIOD: Record<number, { current: number; previous: number; rankings: number }> = {
  7:   { current: 60 * 60,   previous: 12 * 60 * 60, rankings: 60 * 60 },    // 1h/12h/1h
  30:  { current: 120 * 60,  previous: 24 * 60 * 60, rankings: 120 * 60 },   // 2h/24h/2h
  90:  { current: 240 * 60,  previous: 48 * 60 * 60, rankings: 240 * 60 },   // 4h/48h/4h
  365: { current: 360 * 60,  previous: 72 * 60 * 60, rankings: 360 * 60 },   // 6h/72h/6h
};

// Helper to get TTL for a period, falls back to defaults
export function getCacheTTL(days: number): { current: number; previous: number; rankings: number } {
  return CACHE_TTL_BY_PERIOD[days] || {
    current: CACHE_TTL.CURRENT_PERIOD,
    previous: CACHE_TTL.PREVIOUS_PERIOD,
    rankings: CACHE_TTL.RANKINGS,
  };
}

// Valid time periods (in days)
export const VALID_PERIODS = [7, 30, 90, 365] as const;
export type ValidPeriod = typeof VALID_PERIODS[number];

// ServiceTitan Report IDs
export const REPORT_IDS = {
  TECHNICIAN_PERFORMANCE: '3017',
  SOLD_HOURS: '239',
  CRM_LEADS: '2983',
} as const;

// Technicians to exclude from rankings (office staff, etc.)
export const EXCLUDED_TECHNICIANS = [
  'Lucas Brandenburg',
  'Rebekah Sage',
  // Add more as needed
];

// API endpoints
export const SERVICETITAN_AUTH_URL = 'https://auth.servicetitan.io/connect/token';
export const SERVICETITAN_API_BASE = 'https://api.servicetitan.io';
