// Domain types for the MagicLinks admin feature.

export type MagicLinkStatus = "active" | "expired" | "used" | "revoked"

export type MagicLinkRole = "admin" | "sistemas" | "gerente_general" | "gerencia_marketing"

export type DeliveryChannel = "generate_only" | "send_email" | "generate_qr"

export type ExpirationType = "relative" | "absolute"

export type UsageLimitType = "single" | "unlimited" | "specific"

export interface ActivityLogEntry {
  id: string
  timestamp: string // ISO
  result: "success" | "failed_expired" | "failed_used" | "failed_revoked"
  ip: string
  device: string
}

export interface MagicLink {
  id: string
  status: MagicLinkStatus
  // Destinatario
  recipientName: string
  recipientEmail: string | null
  recipientPhone: string | null
  internalNote: string | null
  // Acceso
  role: MagicLinkRole
  scope: string // brand name, shop name, etc.
  scopeId: string
  destinationScreen: string // post-login redirect route
  // Vigencia
  expirationType: ExpirationType
  expirationDate: string | null // ISO, null = sin expiración
  deferredActivation: string | null // ISO date, null = inmediata
  usageLimitType: UsageLimitType
  usageLimit: number | null // null = unlimited, 1 = single, N = specific
  usageCount: number // current uses
  // Entrega
  deliveryChannel: DeliveryChannel
  // Metadata
  url: string // the generated magic link URL
  createdBy: string // admin name
  createdAt: string // ISO
  updatedAt: string // ISO
  // Activity
  activity: ActivityLogEntry[]
}

export interface CreateMagicLinkInput {
  recipientName: string
  recipientEmail: string | null
  recipientPhone: string | null
  internalNote: string | null
  role: MagicLinkRole
  scope: string
  scopeId: string
  destinationScreen: string
  expirationType: ExpirationType
  expirationDate: string | null
  deferredActivation: string | null
  usageLimitType: UsageLimitType
  usageLimit: number | null
  deliveryChannel: DeliveryChannel
}

export interface MagicLinkFilters {
  search: string
  status: MagicLinkStatus | "all"
  role: MagicLinkRole | "all"
  dateFrom: string | null
  dateTo: string | null
}

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
