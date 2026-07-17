// ─── Lead domain types ───────────────────────────────────────────

export type LeadStatus = "new" | "contacted" | "qualified" | "lost"

export type LeadSource = "web" | "chatbot" | "otro"

export interface Quote {
  id_quotes: number
  lead_id: number
  product_quotes: string
  requested_amount_quotes: string // decimal as string
  down_payment_quotes: string // decimal as string
  term_months_quotes: number
  annual_interest_rate_quotes: string // decimal as string
  monthly_payment_quotes: string // decimal as string
  contact_preference_quotes: string
  result_status_quotes: string
  createdAt: string
  updatedAt: string
}

export interface LeadNote {
  manager_lead_note: string
  note_lead_note: string
}

export interface Lead {
  id_lead: number
  name_lead: string
  company_lead: string | null
  email_lead: string | null
  phone_lead: string | null
  message_lead: string | null
  status_lead: LeadStatus
  source_lead: LeadSource
  accepted_terms_lead: boolean
  accepted_terms_at: string | null
  accepted_terms_ip: string | null
  name_service: string | null
}

export interface LeadFilters {
  search: string
  status: LeadStatus | "all"
  source: LeadSource | "all"
}
