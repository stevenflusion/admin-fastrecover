"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/leads/StatusBadge"
import { LeadNotes } from "@/components/leads/LeadNotes"
import type { Lead, LeadStatus, LeadSource, LeadNote } from "@/lib/types"
import { updateLeadStatus, getLeadNotes } from "@/lib/leads"

const statusLabels: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  lost: "Perdido",
}

const sourceLabels: Record<LeadSource, string> = {
  web: "Web",
  chatbot: "Chatbot",
  otro: "Otro",
}

interface LeadDetailDrawerProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (updated: Lead) => void
  onDeleteNoteRequest: (onConfirm: () => void) => void
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function LeadDetailDrawer({
  lead,
  open,
  onOpenChange,
  onStatusChange,
  onDeleteNoteRequest,
}: LeadDetailDrawerProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)
  const [notes, setNotes] = React.useState<LeadNote[]>([])

  React.useEffect(() => {
    if (!open || !lead) {
      setNotes([])
      return
    }

    let cancelled = false
    getLeadNotes(lead.id_lead).then((data) => {
      if (!cancelled) setNotes(data)
    })

    return () => {
      cancelled = true
    }
  }, [open, lead?.id_lead])

  if (!lead) return null

  const handleStatusChange = async (next: LeadStatus) => {
    if (next === lead.status_lead) return
    setIsUpdatingStatus(true)
    try {
      const updated = await updateLeadStatus(lead.id_lead, next)
      onStatusChange(updated)
      toast.success("Estado actualizado")
    } catch {
      toast.error("No se pudo actualizar el estado")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return "—"
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-slot="lead-detail-drawer"
        side="right"
        className="sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>Detalle de Lead</SheetTitle>
          <SheetDescription>{lead.name_lead}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
          <div className="flex flex-col gap-3">
            <StatusBadge status={lead.status_lead} size="lg" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Cambiar estado:
              </span>
              <Select
                value={lead.status_lead}
                onValueChange={(value) =>
                  handleStatusChange(value as LeadStatus)
                }
                disabled={isUpdatingStatus}
              >
                <SelectTrigger
                  data-slot="lead-detail-status-select"
                  className="w-40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{statusLabels.new}</SelectItem>
                  <SelectItem value="contacted">
                    {statusLabels.contacted}
                  </SelectItem>
                  <SelectItem value="qualified">
                    {statusLabels.qualified}
                  </SelectItem>
                  <SelectItem value="lost">{statusLabels.lost}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <section className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Información general</h4>
            <div className="flex flex-col gap-2">
              <SummaryRow label="Nombre" value={lead.name_lead} />
              <SummaryRow label="Email" value={lead.email_lead ?? "—"} />
              <SummaryRow label="Teléfono" value={lead.phone_lead ?? "—"} />
              <SummaryRow label="Empresa" value={lead.company_lead ?? "—"} />
              <SummaryRow
                label="Origen"
                value={sourceLabels[lead.source_lead]}
              />
              <SummaryRow
                label="Mensaje"
                value={lead.message_lead ?? "—"}
              />
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Términos</h4>
            <div className="flex flex-col gap-2">
              <SummaryRow
                label="Aceptados"
                value={lead.accepted_terms_lead ? "Sí" : "No"}
              />
              <SummaryRow
                label="Fecha"
                value={formatDate(lead.accepted_terms_at)}
              />
              <SummaryRow label="IP" value={lead.accepted_terms_ip ?? "—"} />
            </div>
          </section>

          <LeadNotes
            leadId={lead.id_lead}
            notes={notes}
            onNotesChange={setNotes}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { LeadDetailDrawer }
export type { LeadDetailDrawerProps }
