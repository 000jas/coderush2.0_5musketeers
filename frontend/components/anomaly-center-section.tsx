'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ShieldAlert,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function AnomalyCenterSection() {
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filters and Triaging Panel */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
          {/* Severity Tabs */}
          <div className="flex bg-muted/65 p-0.5 rounded-lg border border-border/80 w-full md:w-auto shrink-0 overflow-x-auto">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <Button
                key={sev}
                variant={filterSeverity === sev ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-md px-3.5 shrink-0"
                onClick={() => setFilterSeverity(sev)}
              >
                {sev}
              </Button>
            ))}
          </div>

          {/* Title Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search anomaly codes, warning descriptions, or subsystem logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Triaging Layout split */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Incidents Stream Table (Left) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="border-border/70 shadow-xs flex flex-col h-full min-h-[400px] left-accent">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4.5 text-danger" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-lg">Incident Logs Registry</CardTitle>
                    <CardDescription className="text-xs">Incoming anomaly packages routed from command buses.</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-md">0 Warnings Active</Badge>
              </div>
            </CardHeader>
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-xs tracking-wider">Severity</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Subsystem Name</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Event Message</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Stamp Time</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                        <div className="grid size-10 place-items-center rounded-xl bg-muted/60 text-muted-foreground/80 mb-3.5">
                          <AlertTriangle className="size-5" />
                        </div>
                        <h4 className="font-semibold text-sm text-foreground">Zero anomalies detected</h4>
                        <p className="text-xs text-muted-foreground mt-1 text-balance">
                          No telemetry logs exceed nominal boundaries. Anomalies will stream here if hardware threshold limits are crossed.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Investigation Panel card (Right) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="border-border/70 shadow-xs h-full flex flex-col min-h-[400px] charcoal-panel">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="size-4.5 text-primary" />
                <span>Investigation Desk</span>
              </CardTitle>
              <CardDescription className="text-xs">Examine stack trace logs and recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center p-6 text-center">
              <div className="flex flex-col items-center max-w-xs">
                <div className="grid size-10 place-items-center rounded-xl bg-muted/60 text-muted-foreground/80 mb-3">
                  <Info className="size-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">No case file open</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                  Select an active anomaly incident log from the stream stack to begin tracking subsystem readouts.
                  </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
