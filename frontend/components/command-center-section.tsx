'use client'

import { useState } from 'react'
import {
  Terminal,
  ChevronRight,
  Database,
  Layers,
  Hash,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function CommandCenterSection() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Mission Select Header Block */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary grid place-items-center">
              <Database className="size-4" />
            </div>
            <span className="text-sm font-semibold select-none">Target Spacecraft:</span>
          </div>
          
          <div className="flex-1 w-full flex flex-wrap gap-2">
            <Button variant="outline" className="h-9 text-xs rounded-xl bg-card border-border/80" disabled>
              Select Target Mission...
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Central split structure */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Dispatch Composer Panel (Left) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
          {/* Command Composer Card */}
          <Card className="border-border/70 shadow-xs left-accent">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Terminal className="size-4.5 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-lg">Command Composer</CardTitle>
                  <CardDescription className="text-xs">Select command templates and define parameter values.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Command Template</label>
                <Button variant="outline" className="justify-between h-10 w-full text-xs font-mono rounded-xl" disabled>
                  <span>SELECT TEMPLATE SCHEMA...</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parameters Form</label>
                <div className="border border-dashed border-border rounded-xl p-6 text-center bg-muted/20">
                  <p className="text-xs text-muted-foreground select-none">
                    Select a command template above to generate input forms for schema parameter mappings.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40 mt-2">
                <Button variant="outline" className="h-9 text-xs rounded-xl" disabled>
                  Validate Command
                </Button>
                <Button className="h-9 text-xs rounded-xl" disabled>
                  Queue Packet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Panel Card */}
          <Card className="border-border/70 shadow-xs charcoal-panel">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <Hash className="size-4.5 text-primary" />
                <span>Validation Panel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                <AlertTriangle className="size-5 text-muted-foreground/60 mb-2" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No active command package is in draft. Input packet code to trigger structural audits, access control validation, and checksum verification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue and Queue Stream log tracking (Right) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
          {/* Command Queue Box */}
          <Card className="border-border/70 shadow-xs flex-1 flex flex-col">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-semibold">Uplink Queue</CardTitle>
                <Badge variant="outline" className="rounded-md font-mono text-[10px]">0 Queued</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center items-center text-center bg-muted/10">
              <div className="flex flex-col items-center max-w-xs justify-center">
                <Layers className="size-5 text-muted-foreground/80 mb-2.5" />
                <h4 className="font-semibold text-sm text-foreground">Queue is empty</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                  No commands are scheduled for the next transmission cycle. Add validated actions to dispatch packets.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Execution History */}
          <Card className="border-border/70 shadow-xs flex-1 flex flex-col">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-semibold">Transmission History</CardTitle>
                <Badge variant="outline" className="rounded-md font-mono text-[10px]">0 Dispatched</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center items-center text-center">
              <div className="flex flex-col items-center max-w-xs justify-center">
                <Terminal className="size-5 text-muted-foreground/80 mb-2.5" />
                <h4 className="font-semibold text-sm text-foreground">No packets recorded</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                  Command logs empty for this session. Past executed commands will register here upon signal confirmation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
