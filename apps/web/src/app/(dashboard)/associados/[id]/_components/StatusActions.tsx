'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldOff, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared'

type StatusAction = 'suspender' | 'inativar' | 'reativar'

const CONFIG: Record<StatusAction, {
  label: string
  targetStatus: string
  title: string
  description: string
  confirmLabel: string
  variant: 'destructive' | 'default'
}> = {
  suspender: {
    label: 'Suspender',
    targetStatus: 'SUSPENSO',
    title: 'Suspender associado',
    description: 'O acesso ao sistema será bloqueado imediatamente. O associado não conseguirá fazer login até ser reativado.',
    confirmLabel: 'Suspender',
    variant: 'destructive',
  },
  inativar: {
    label: 'Inativar',
    targetStatus: 'INATIVO',
    title: 'Inativar associado',
    description: 'O associado será marcado como inativo e terá o acesso ao sistema revogado. Use esta opção para membros que saíram da associação.',
    confirmLabel: 'Inativar',
    variant: 'destructive',
  },
  reativar: {
    label: 'Reativar',
    targetStatus: 'ATIVO',
    title: 'Reativar associado',
    description: 'O acesso ao sistema será restaurado e o associado poderá fazer login normalmente.',
    confirmLabel: 'Reativar',
    variant: 'default',
  },
}

interface Props {
  status: string
  onAction: (targetStatus: string) => Promise<void>
  isPending: boolean
}

export function StatusActions({ status, onAction, isPending }: Props) {
  const [confirm, setConfirm] = useState<StatusAction | null>(null)

  const actions: StatusAction[] = []
  if (status === 'ATIVO') actions.push('suspender', 'inativar')
  else if (status === 'SUSPENSO') actions.push('reativar', 'inativar')
  else if (status === 'INATIVO') actions.push('reativar')

  if (actions.length === 0) return null

  const cfg = confirm ? CONFIG[confirm] : null

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const c = CONFIG[action]
          return (
            <Button
              key={action}
              size="sm"
              variant="outline"
              className={
                c.variant === 'destructive'
                  ? 'border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive'
                  : ''
              }
              disabled={isPending}
              onClick={() => setConfirm(action)}
            >
              {action === 'suspender' && <ShieldOff className="h-3.5 w-3.5 mr-1.5" />}
              {action === 'inativar' && <UserX className="h-3.5 w-3.5 mr-1.5" />}
              {action === 'reativar' && <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />}
              {c.label}
            </Button>
          )
        })}
      </div>

      {cfg && (
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(o) => { if (!o) setConfirm(null) }}
          title={cfg.title}
          description={cfg.description}
          confirmLabel={cfg.confirmLabel}
          variant={cfg.variant}
          isPending={isPending}
          onConfirm={async () => {
            await onAction(cfg.targetStatus)
            setConfirm(null)
          }}
        />
      )}
    </>
  )
}
