export type LeadCreated = {
  status: 'success';
  lead_id: number;
  credit_score: number | null;
  bre_status: 'Eligible' | 'Not Eligible';
};

export type ApplicationResult = LeadCreated & {
  reasons: string[];
  warning: string | null;
};

export type Lead = {
  id: number;
  full_name: string;
  mobile: string;
  email: string;
  date_of_birth: string;
  city: string;
  pincode: string;
  loan_type: string;
  employment_type: string;
  monthly_income: string;
  loan_amount: string;
  property_value: string;
  credit_score: number | null;
  credit_score_error: string | null;
  bre_status: 'Eligible' | 'Not Eligible';
  rejection_reasons: string[];
  created_at: string;
};
export type LeadPage = {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
};
export type Summary = {
  total_leads: number;
  eligible_leads: number;
  rejected_leads: number;
  average_credit_score: number | null;
};
export type Rule = {
  id: number;
  rule_name: string;
  field: string;
  operator: string;
  value: string;
  reference_field: string | null;
  rejection_message: string;
  is_active: boolean;
};
