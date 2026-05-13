'use client'

import * as React from 'react'
import type { ViewMode } from '@/components/shared/ViewToggle'

export function useViewToggle(storageKey: string, defaultView: ViewMode = 'list'): [ViewMode, (v: ViewMode) => void] {
  const [view, setView] = React.useState<ViewMode>(() => {
    if (typeof window === 'undefined') return defaultView
    const stored = window.localStorage.getItem(`view-toggle:${storageKey}`)
    return stored === 'list' || stored === 'grid' ? stored : defaultView
  })

  const update = React.useCallback(
    (v: ViewMode) => {
      setView(v)
      window.localStorage.setItem(`view-toggle:${storageKey}`, v)
    },
    [storageKey],
  )

  return [view, update]
}
