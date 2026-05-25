'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ColheitasTab } from './ColheitasTab'
import { PoolTab } from './PoolTab'
import { TiposTab } from './TiposTab'

export function AdminProducao() {
  return (
    <Tabs defaultValue="colheitas">
      <TabsList>
        <TabsTrigger value="colheitas">Colheitas</TabsTrigger>
        <TabsTrigger value="pool">Pool de Estoque</TabsTrigger>
        <TabsTrigger value="tipos">Tipos de Matéria-Prima</TabsTrigger>
      </TabsList>
      <TabsContent value="colheitas" className="mt-4">
        <ColheitasTab />
      </TabsContent>
      <TabsContent value="pool" className="mt-4">
        <PoolTab />
      </TabsContent>
      <TabsContent value="tipos" className="mt-4">
        <TiposTab />
      </TabsContent>
    </Tabs>
  )
}
