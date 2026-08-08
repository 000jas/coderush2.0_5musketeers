'use client'

import { useState } from 'react'
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

export function TimelinePlannerSection({ plan }: { plan: any }) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month')

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filters and Scheduler Control bar */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" className="size-9 rounded-lg" disabled>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-semibold select-none px-2 shrink-0">Select Range...</span>
            <Button variant="outline" size="icon" className="size-9 rounded-lg" disabled>
              <ChevronRight className="size-4" />
            </Button>
            <Badge variant="secondary" className="ml-2 font-mono h-6 text-[10px]">UTC</Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex bg-muted/65 p-0.5 rounded-lg border border-border/80">
              <Button 
                variant={viewMode === 'day' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 text-xs rounded-md px-3"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 text-xs rounded-md px-3"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 text-xs rounded-md px-3"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
            <Button variant="outline" className="h-9 rounded-xl gap-2 text-xs" disabled>
              <Filter className="size-3.5" />
              <span>Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operations Tracks view & panels split */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Grid Container (Left) */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Card className="border-border/70 shadow-xs h-full flex flex-col min-h-[450px] left-accent">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4.5 text-primary" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-lg">Event Tracks Matrix</CardTitle>
                    <CardDescription className="text-xs">Synchronized telemetry scheduler timeline.</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">No streams connected</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center p-6 bg-muted/10">
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-muted/70 text-muted-foreground/80 mb-4">
                  <CalendarDays className="size-6 text-muted-foreground/80" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Timeline Empty</h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed text-balance">
                  No timeline schedule is active for this workspace. Integrate an operational timetable pipeline to populate calendar timelines.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agenda layout list (Right) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="border-border/70 shadow-xs h-full flex flex-col min-h-[400px] charcoal-panel">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="size-4.5 text-primary" />
                <span>Agenda Queue</span>
              </CardTitle>
              <CardDescription className="text-xs">Timeline agenda checklist for the selected day.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-5 justify-start">
              {plan ? (
                <div className="flex flex-col gap-3.5 text-left w-full h-full">
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Risk</span>
                    <Badge variant={plan.risk_level === 'low' ? 'secondary' : 'destructive'} className={plan.risk_level === 'low' ? 'bg-green-500/10 text-green-500 border-none' : ''}>
                      {plan.risk_level}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-auto">Precautions Queue</span>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {plan.precautions?.map((prec: string, idx: number) => (
                        <div key={idx} className="flex gap-2 text-xs text-muted-foreground leading-normal p-1.5 bg-muted/20 border border-border/20 rounded-lg">
                          <span className="text-primary font-bold">▲</span>
                          <span>{prec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center max-w-xs h-full grow">
                  <div className="grid size-10 place-items-center rounded-xl bg-muted/60 mb-3 text-muted-foreground">
                    <Layers className="size-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">No operations loaded</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                    Select a date slot in the timelines grid planner to filter and inspect agenda tasks.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
