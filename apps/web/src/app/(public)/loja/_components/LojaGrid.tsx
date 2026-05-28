'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProdutoResponse } from '@/lib/api/catalogo'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function EstoqueBadge({ qtd }: { qtd: number }) {
  if (qtd === 0)
    return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Sem estoque</Badge>
  if (qtd <= 5)
    return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-600">Apenas {qtd} restantes</Badge>
  return null
}

interface LojaGridProps {
  produtos: ProdutoResponse[]
}

export function LojaGrid({ produtos }: LojaGridProps) {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    if (!busca.trim()) return produtos
    const q = busca.toLowerCase()
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.descricao?.toLowerCase().includes(q),
    )
  }, [produtos, busca])

  return (
    <div>
      {/* Busca */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-base font-medium">
            {busca ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {busca ? 'Tente outra busca.' : 'Volte em breve — novos lotes em preparação.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtrados.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="relative h-48 bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
                {p.imagemUrl ? (
                  <Image
                    src={p.imagemUrl}
                    alt={p.nome}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-amber-300" />
                  </div>
                )}
                {p.quantidadeEstoque <= 5 && (
                  <div className="absolute top-2 left-2">
                    <EstoqueBadge qtd={p.quantidadeEstoque} />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 p-4 gap-1.5">
                <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                  {p.nome}
                </p>
                {p.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>
                )}
                <div className="mt-auto pt-3 flex flex-col gap-2">
                  <p className="text-base font-bold text-primary">{fmt(p.preco)}</p>
                  <Button asChild size="sm" variant="outline" className="w-full text-xs">
                    <Link href={`/loja/${p.slug}`}>Ver detalhes</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
