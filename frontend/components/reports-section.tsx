'use client'

import { BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ReportsSection() {
  return (
    <Card className="border border-dashed border-border/80 rounded-2xl bg-card/40 my-6 py-16 px-4 left-accent">
      <CardContent className="flex flex-col items-center justify-center text-center p-0">
        <div className="grid size-12 place-items-center rounded-2xl bg-muted/65 text-muted-foreground/80 mb-4">
          <BarChart3 className="size-6 text-muted-foreground/80" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">No reports generated</h3>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-sm text-balance leading-relaxed">
          This module is ready for backend integration. Connecting the reporter stream allows operators to build automated spreadsheets and download execution analysis PDFs.
        </p>
      </CardContent>
    </Card>
  )
}
