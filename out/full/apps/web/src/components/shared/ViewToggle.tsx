'use client'

import { LayoutList, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Modo de visualização: lista ou grid. */
export type ViewMode = 'list' | 'grid'

/** Alternador entre visualização em lista e em grid. */
export function ViewToggle({ view, onViewChange }: { view: ViewMode; onViewChange: (v: ViewMode) => void }) {
  return (
    <div className="flex overflow-hidden rounded-md border">
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8 rounded-none border-r"
        onClick={() => onViewChange('list')}
        title="Lista"
      >
        <LayoutList className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8 rounded-none"
        onClick={() => onViewChange('grid')}
        title="Cards"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
