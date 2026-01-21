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

// Gross margin data
export interface GrossMarginData {
  totalRevenue: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  totalCost: number;
  grossMargin: number;
  grossMarginPercent: number;
  laborPercent: number;
  materialPercent: number;
  equipmentPercent: number;
}

// Cancelled job details
export interface CancelledJob {
  id: number;
  number: string;
  customerName: string;
  cancelReason: string;
  cancelledOn: string;
  scheduledDate?: string;
  jobType?: string;
}

// Cancelled jobs summary
export interface CancelledJobsSummary {
  total: number;
  jobs: CancelledJob[];
  byReason: Record<string, number>;
}

// Goal configuration for ranking cards
export interface GoalConfig {
  value: number;
  formatValue: (value: number) => string;
  label?: string;
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  CURRENT_PERIOD: 120 * 60,      // 2 hours
  PREVIOUS_PERIOD: 24 * 60 * 60, // 24 hours
  RANKINGS: 120 * 60,            // 2 hours
  TECHNICIAN: 120 * 60,          // 2 hours
} as const;

// Valid time periods (in days)
export const VALID_PERIODS = [7, 30, 90, 365] as const;
export type ValidPeriod = typeof VALID_PERIODS[number];

// ServiceTitan Report IDs
export const REPORT_IDS = {
  TECHNICIAN_PERFORMANCE: '3017',
  SOLD_HOURS: '239',
  GROSS_MARGIN: '3874',
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
