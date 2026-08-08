'use client'

import { useState } from 'react'
import {
  Radio,
  Search,
  SlidersHorizontal,
  Plus,
  Globe2,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function MissionsSection({ telemetry }: { telemetry: any }) {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Filters Bar */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search missions by name, code, or subsystem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-muted/20 border-border/80 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs" disabled>
              <Filter className="size-3.5" />
              <span>Orbit Type</span>
            </Button>
            <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs" disabled>
              <SlidersHorizontal className="size-3.5" />
              <span>Status</span>
            </Button>
            <Button variant="ghost" className="h-10 rounded-xl text-xs" disabled>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Mission List Pane (Left) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <Card className="border-border/70 shadow-xs flex-1 left-accent">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="size-4.5 text-primary" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-lg">Registered Hardware</CardTitle>
                    <CardDescription className="text-xs">Database files mapped to physical uplinks.</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-md">0 Columns Loaded</Badge>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-xs tracking-wider">Mission Name</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">System Code</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Orbit Profile</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {telemetry ? (
                    <TableRow className="cursor-pointer hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-sm">StellX-1</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">STX-1</TableCell>
                      <TableCell className="text-xs text-muted-foreground">LEO - Orbit #{telemetry['Orbit Number']}</TableCell>
                      <TableCell>
                        <Badge variant={telemetry['Overall Satellite Health'] === 'Good' ? 'secondary' : 'destructive'} className={cn("text-[10px] capitalize", telemetry['Overall Satellite Health'] === 'Good' ? 'bg-green-500/10 text-green-500 border-none' : '')}>
                          {telemetry['Overall Satellite Health']}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                          <div className="grid size-10 place-items-center rounded-xl bg-muted/60 text-muted-foreground/80 mb-3.5">
                            <Radio className="size-5" />
                          </div>
                          <h4 className="font-semibold text-sm text-foreground">No missions registered</h4>
                          <p className="text-xs text-muted-foreground mt-1 text-balance">
                            No active profiles detected in local registers. Connect your command database to fetch payload registers.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Mission Details Panel (Right) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="border-border/70 shadow-xs h-full flex flex-col min-h-[400px] charcoal-panel">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="size-4.5 text-primary" />
                <span>Telemetry Inspector</span>
              </CardTitle>
              <CardDescription className="text-xs">Active sensor readouts and properties details.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-5 gap-4">
              {telemetry ? (
                <div className="flex flex-col gap-3.5 text-left w-full h-full justify-center">
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode</span>
                    <span className="text-sm font-semibold">{telemetry['Mission Mode']}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</span>
                    <span className="text-sm font-semibold truncate max-w-[180px]">{telemetry['Current Task']}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Battery</span>
                    <span className="text-sm font-semibold">{telemetry['Battery Percentage']}% ({telemetry['Battery Temperature']}°C)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Solar Output</span>
                    <span className="text-sm font-semibold text-green-500">{telemetry['Solar Panel Output']} W</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Power Consumption</span>
                    <span className="text-sm font-semibold text-red-500">{telemetry['Power Consumption']} W</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signal Strength</span>
                    <span className="text-sm font-semibold">{telemetry['Signal Strength']} dBm</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Camera Status</span>
                    <span className="text-sm font-semibold">{telemetry['Camera Status']}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Images Captured</span>
                    <span className="text-sm font-semibold">{telemetry['Images Captured']}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Fault</span>
                    <Badge variant={telemetry['Active Fault'] === 'None' ? 'secondary' : 'destructive'} className="text-[10px] uppercase">
                      {telemetry['Active Fault']}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="flex flex-col items-center max-w-xs">
                    <div className="grid size-10 place-items-center rounded-xl bg-muted/60 text-muted-foreground/80 mb-3">
                      <Globe2 className="size-5" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">No selection</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                      Select a mission profile from the database registry to start real-time telemetry streaming and inspect parameters.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
