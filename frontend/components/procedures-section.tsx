'use client'

import { useState } from 'react'
import {
  BookOpen,
  Search,
  CheckSquare,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function ProceduresSection({ plan }: { plan: any }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', 'Thermals', 'Comms', 'Power Systems', 'Orbits', 'Safety']

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Procedures library filter header */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
          {/* Category tabs */}
          <div className="flex bg-muted/65 p-0.5 rounded-lg border border-border/80 w-full md:w-auto shrink-0 overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs rounded-md px-3.5 shrink-0"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Runbook Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search procedures by code, instruction keyword, or tag..."
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

      {/* Detailed content layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* SOP index list (Left) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="border-border/70 shadow-xs flex flex-col h-full min-h-[400px] left-accent">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4.5 text-primary" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-lg">Runbook Library</CardTitle>
                    <CardDescription className="text-xs">Database SOP index files linked to operating checklists.</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-md">0 SOPs Cached</Badge>
              </div>
            </CardHeader>
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-xs tracking-wider">Procedure Name</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Index Code</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Classification</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider">Revision</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan ? (
                    <TableRow className="cursor-pointer hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-sm truncate max-w-[200px]">{plan.headline}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">SOP-DIRECTIVE</TableCell>
                      <TableCell>
                        <Badge variant={plan.risk_level === 'low' ? 'secondary' : 'destructive'} className={plan.risk_level === 'low' ? 'bg-green-500/10 text-green-500 border-none' : ''}>
                          {plan.risk_level === 'low' ? 'Nominal Routine' : 'Anomaly Recovery'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">REV-1.1</TableCell>
                      <TableCell className="text-right">
                        <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                          <div className="grid size-10 place-items-center rounded-xl bg-muted/60 text-muted-foreground/80 mb-3.5">
                            <BookOpen className="size-5" />
                          </div>
                          <h4 className="font-semibold text-sm text-foreground">No procedures loaded</h4>
                          <p className="text-xs text-muted-foreground mt-1 text-balance">
                            Procedural library index is empty. Link standard files to upload emergency or system SOPs.
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

        {/* Checklist executor (Right) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="border-border/70 shadow-xs h-full flex flex-col min-h-[400px] charcoal-panel">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="size-4.5 text-primary" />
                <span>Checklist Inspector</span>
              </CardTitle>
              <CardDescription className="text-xs">Execution steps verification log checklist.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-5 justify-start">
              {plan ? (
                <div className="flex flex-col gap-3.5 text-left w-full h-full">
                  <div className="pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Required Steps:</div>
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
                    <div className="flex items-start gap-2.5 p-2 bg-muted/20 border border-border/20 rounded-lg text-xs leading-normal">
                      <span className="text-primary font-bold">▶</span>
                      <div>
                        <span className="font-semibold block text-white mb-0.5">Instruction Directive</span>
                        <span className="text-muted-foreground">{plan.satellite_instruction}</span>
                      </div>
                    </div>
                    {plan.operator_notes?.map((step: string, idx: number) => (
                      <label key={idx} className="flex items-start gap-2.5 cursor-pointer hover:bg-muted/10 p-2 rounded-lg transition-colors">
                        <input type="checkbox" className="mt-0.5 accent-primary" />
                        <span className="text-xs text-muted-foreground leading-normal">{step}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="flex flex-col items-center max-w-xs justify-center">
                    <div className="grid size-10 place-items-center rounded-xl bg-muted/60 mb-3 text-muted-foreground">
                      <Info className="size-5" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">SOP Not Activated</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-balance">
                      Choose a routine or diagnostic runbook from the library stream index to inspect action steps.
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
