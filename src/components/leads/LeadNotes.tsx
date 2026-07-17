"use client"

import * as React from "react"
import { PlusIcon, CheckIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { LeadNote } from "@/lib/types"
import { createLeadNote } from "@/lib/leads"

interface LeadNotesProps {
  leadId: number
  notes: LeadNote[]
  onNotesChange: (notes: LeadNote[]) => void
}

function LeadNotes({ leadId, notes, onNotesChange }: LeadNotesProps) {
  const [isCreating, setIsCreating] = React.useState(false)
  const [newManager, setNewManager] = React.useState("")
  const [newNote, setNewNote] = React.useState("")

  const handleCreate = async () => {
    if (!newManager.trim() || !newNote.trim()) {
      toast.error("Completá el autor y la nota")
      return
    }

    try {
      const created = await createLeadNote({
        manager_lead_note: newManager.trim(),
        note_lead_note: newNote.trim(),
        lead_id: leadId,
      })
      onNotesChange([created, ...notes])
      setIsCreating(false)
      setNewManager("")
      setNewNote("")
      toast.success("Nota creada")
    } catch {
      toast.error("No se pudo crear la nota")
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Notas</h4>
        {!isCreating && (
          <Button
            data-slot="lead-notes-add"
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <PlusIcon className="size-4" />
            Agregar nota
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
          <Input
            data-slot="lead-notes-new-manager"
            placeholder="Autor"
            value={newManager}
            onChange={(e) => setNewManager(e.target.value)}
          />
          <Textarea
            data-slot="lead-notes-new-text"
            placeholder="Escribí una nota..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreating(false)
                setNewManager("")
                setNewNote("")
              }}
            >
              <XIcon className="size-4" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCreate}>
              <CheckIcon className="size-4" />
              Guardar
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay notas para este lead.
          </p>
        ) : (
          notes.map((note, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Separator />}
              <div className="flex flex-col gap-1 py-1">
                <span className="text-sm font-medium">
                  {note.manager_lead_note}
                </span>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.note_lead_note}
                </p>
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </section>
  )
}

export { LeadNotes }
export type { LeadNotesProps }
