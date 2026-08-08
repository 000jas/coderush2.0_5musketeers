'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
  activeSection: string
  setActiveSection: (section: string) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  const handleSetCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed: handleSetCollapsed,
        isMobileOpen,
        setIsMobileOpen,
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
