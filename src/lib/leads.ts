// Repository facade — real HTTP calls to the SH Fast Recover API for leads management.

import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from "./api-client"
import type { Lead, LeadNote, LeadFilters, LeadStatus } from "./types"

function toQueryParams(
  filters?: LeadFilters
): Record<string, string> | undefined {
  if (!filters) return undefined

  const params: Record<string, string> = {}
  if (filters.search) params.search = filters.search
  if (filters.status && filters.status !== "all") params.status = filters.status
  if (filters.source && filters.source !== "all") params.source = filters.source

  return params
}

// Get all leads
export async function getLeadsWithQuotes(
  filters?: LeadFilters
): Promise<Lead[]> {
  const response = await apiGet<{ success: boolean; data: Lead[] }>(
    "/leads",
    toQueryParams(filters)
  )
  return response.data
}

// Get a single lead by ID. Returns null when the API responds with 404.
export async function getLeadById(id: number): Promise<Lead | null> {
  try {
    const response = await apiGet<{ success: boolean; data: Lead }>(
      `/leads/${id}`
    )
    return response.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

// Update lead status
export async function updateLeadStatus(
  id: number,
  status: LeadStatus
): Promise<Lead> {
  const response = await apiPatch<{ success: boolean; data: Lead }>(
    `/leads/${id}`,
    { status_lead: status }
  )
  return response.data
}

// Get notes for a lead
export async function getLeadNotes(id: number): Promise<LeadNote[]> {
  const response = await apiGet<{ success: boolean; data: LeadNote[] }>(
    `/notes/lead/${id}`
  )
  return response.data
}

// Create a note for a lead
export async function createLeadNote(input: {
  manager_lead_note: string
  note_lead_note: string
  lead_id: number
}): Promise<LeadNote> {
  const response = await apiPost<{ success: boolean; data: LeadNote }>(
    "/notes",
    input
  )
  return response.data
}
