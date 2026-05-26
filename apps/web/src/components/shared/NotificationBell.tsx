'use client'

import { Bell, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotificacoes, useContarNaoLidas, useMarcarLida, useMarcarTodasLidas } from '@/hooks/useNotificacoes'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { data: countData } = useContarNaoLidas()
  const { data: notificacoes, isLoading } = useNotificacoes(30)
  const marcarLida = useMarcarLida()
  const marcarTodas = useMarcarTodasLidas()

  const count = countData?.count ?? 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center rounded-full"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Notificações</span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground"
              onClick={() => marcarTodas.mutate()}
              disabled={marcarTodas.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {isLoading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Carregando…</div>
          )}
          {!isLoading && (!notificacoes || notificacoes.length === 0) && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação.
            </div>
          )}
          {notificacoes?.map((n) => (
            <button
              key={n.id}
              className={cn(
                'w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors',
                !n.lida && 'bg-accent/5',
              )}
              onClick={() => {
                if (!n.lida) marcarLida.mutate(n.id)
              }}
            >
              <div className="flex items-start gap-2">
                {!n.lida && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                )}
                <div className={cn('flex-1 min-w-0', n.lida && 'pl-4')}>
                  <p className="text-sm font-medium leading-tight truncate">{n.titulo}</p>
                  {n.corpo && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.corpo}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(n.criadoEm), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
