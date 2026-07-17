"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/leads/StatusBadge"
import { Badge } from "@/components/ui/badge"
import type { Lead, LeadSource } from "@/lib/types"

const sourceLabels: Record<LeadSource, string> = {
  web: "Web",
  chatbot: "Chatbot",
  otro: "Otro",
}

interface LeadsTableProps {
  leads: Lead[]
  onRowClick: (lead: Lead) => void
}

function LeadsTable({ leads, onRowClick }: LeadsTableProps) {
  return (
    <div
      data-slot="leads-table"
      className="rounded-xl border border-border bg-card shadow-sm"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Estado</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Ciudad / Origen</TableHead>
            <TableHead className="w-[120px]">Servicio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id_lead}
              data-slot="leads-table-row"
              className="cursor-pointer"
              onClick={() => onRowClick(lead)}
            >
              <TableCell>
                <StatusBadge status={lead.status_lead} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{lead.name_lead}</span>
                  {lead.message_lead ? (
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {lead.message_lead}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {lead.email_lead ?? "—"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {lead.phone_lead ?? "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    {lead.company_lead ?? "—"}
                  </span>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {sourceLabels[lead.source_lead]}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {lead.name_service ?? "—"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { LeadsTable }
export type { LeadsTableProps }
