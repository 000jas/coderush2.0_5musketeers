'use client'

import { useState } from 'react'
import {
  Activity,
  Search,
  SlidersHorizontal,
  Info,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function EventTimelineSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filter bar card */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
          {/* Event categories */}
          <div className="flex bg-muted/65 p-0.5 rounded-lg border border-border/80 w-full md:w-auto shrink-0 overflow-x-auto">
            {['All', 'Commands', 'Telemetry', 'Network', 'Systems'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-md px-3.5 shrink-0"
                onClick={() => setFilterType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Event Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search event logs by name, keyword, or operator ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/80 rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs" disabled>
              <SlidersHorizontal className="size-3.5" />
              <span>Sort</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit layout grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Timeline Feed column (Left) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="border-border/70 shadow-xs flex flex-col h-full min-h-[450px] left-accent">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="size-4.5 text-primary" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-lg">Event Log Feed</CardTitle>
                    <CardDescription className="text-xs">Journaled operational event events listed chronologically.</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">0 Events Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center p-6 bg-muted/10">
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-muted/70 text-muted-foreground/80 mb-4">
                  <Activity className="size-6 text-muted-foreground/80" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Timeline Feed Empty</h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed text-balance">
                  No active events tracked in the current telemetry window. Perform system commands or trigger telemetry packets to record logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details inspection box (Right) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="border-border/70 shadow-xs h-full flex flex-col min-h-[400px] charcoal-panel">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <History className="size-4.5 text-primary" />
                <span>Metadata Inspector</span>
              </CardTitle>
              <CardDescription className="text-xs">Full schema metrics of selected audit event.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center p-6 text-center">
              <div className="flex flex-col items-center max-w-xs justify-center">
                <div className="grid size-10 place-items-center rounded-xl bg-muted/60 mb-3 text-muted-foreground">
                  <Info className="size-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">No selection</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                  Click on an event trail node inside the chronological feed to view raw payload objects and parameters metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
