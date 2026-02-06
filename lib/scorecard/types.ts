// Scorecard Types and Constants

// Technician base data
export interface Technician {
  id: number;
  name: string;
  active: boolean;
}

// Technician KPIs (raw data from reports)
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
  sales: number; // number of completed sales/opportunities
  totalSales: number; // dollar amount of estimates sold (opportunityJobAverage * sales)
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

// Full rankings response
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
  sales: RankedTechnician[];
  totalSales: RankedTechnician[]; // dollar amount of estimates sold
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

// Valid time periods (in days)
export const VALID_PERIODS = [7, 30, 90, 365] as const;
export type ValidPeriod = typeof VALID_PERIODS[number];

// Technicians to exclude from rankings (office staff, etc.)
export const EXCLUDED_TECHNICIANS = [
  'Lucas Brandenburg',
  'Rebekah Sage',
  'Michael Hamilton',
  'Terry Brandenburg',
  'Landon Christian',
  'Imanol Pena',
];

// Technicians whose archived profiles should be merged with their current profile
// Key is the canonical name, values are alternate names to merge into it
export const MERGED_TECHNICIANS: Record<string, string[]> = {
  'Nick McBride': [
    // Add archived profile names here, e.g.:
    // 'Nick McBride (Archived)',
    // 'Nick McBride - OLD',
  ],
  'Brendan Whitney': [
    // Add archived profile names here
  ],
};
