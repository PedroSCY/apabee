import { Injectable } from '@nestjs/common'
import { Mensalidade, MovimentoFinanceiro } from '@apa/core'
import { PrismaService } from '../../../../shared/database/prisma.service'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit')

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const STATUS_PT: Record<string, string> = { PENDENTE: 'Pendente', PAGO: 'Pago', ISENTO: 'Isento' }
const METODO_PT: Record<string, string> = { PRESENCIAL: 'Presencial', TRANSFERENCIA: 'Transferência', ONLINE: 'Online (PIX)' }
const TIPO_PT: Record<string, string> = { ANTECIPACAO: 'Antecipação', RATEIO_FINAL: 'Rateio Final', CUSTO: 'Custo', MENSALIDADE: 'Mensalidade' }

const TIPO_CAMPANHA_PT: Record<string, string> = { PRODUCAO: 'Produção', AQUISICAO: 'Aquisição' }
const STATUS_CAMPANHA_PT: Record<string, string> = { PLANEJADA: 'Planejada', ATIVA: 'Ativa', CONCLUIDA: 'Concluída', LIQUIDADA: 'Liquidada', CANCELADA: 'Cancelada' }
const TIPO_CONTRIBUICAO_PT: Record<string, string> = { COLHEITA: 'Colheita', DINHEIRO: 'Dinheiro' }
const CATEGORIA_CUSTO_PT: Record<string, string> = {
  EMBALAGEM: 'Embalagem', ROTULO: 'Rótulo', TRANSPORTE: 'Transporte', PROCESSAMENTO: 'Processamento',
  CERTIFICACAO: 'Certificação', TAXA: 'Taxa', PERDA: 'Perda', MAO_DE_OBRA_CONTRATADA: 'Mão de obra', OUTRO: 'Outro',
}
const STATUS_ORDEM_PT: Record<string, string> = { RASCUNHO: 'Rascunho', CONCLUIDA: 'Concluída' }

const BOM = '﻿'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(d: Date) {
  return d.toLocaleDateString('pt-BR')
}

function fmtDataHora(d: Date) {
  return d.toLocaleString('pt-BR')
}

@Injectable()
export class RelatorioFinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolverNomes(ids: string[]): Promise<Map<string, string>> {
    const unique = [...new Set(ids)]
    const rows = await this.prisma.associado.findMany({
      where: { id: { in: unique } },
      select: { id: true, usuario: { select: { nome: true } } },
    })
    return new Map(rows.map(r => [r.id, r.usuario.nome]))
  }

  // ─── MENSALIDADES CSV ────────────────────────────────────────────────────────

  async gerarCsvMensalidades(
    mensalidades: Mensalidade[],
    opcoes: { ano: number; mes?: number },
  ): Promise<Buffer> {
    const nomes = await this.resolverNomes(mensalidades.map(m => m.associadoId))
    const titulo = opcoes.mes
      ? `${MESES_PT[opcoes.mes - 1]}/${opcoes.ano}`
      : `${opcoes.ano}`

    const linhas: string[] = [
      `Relatório de Mensalidades — ${titulo}`,
      `Gerado em;${fmtDataHora(new Date())}`,
      '',
      'Associado;Competência;Valor;Status;Método;Data Pagamento',
    ]

    for (const m of mensalidades) {
      linhas.push([
        nomes.get(m.associadoId) ?? m.associadoId,
        m.competenciaLabel,
        fmtBRL(m.valor),
        STATUS_PT[m.status] ?? m.status,
        m.metodoPagamento ? (METODO_PT[m.metodoPagamento] ?? m.metodoPagamento) : '—',
        m.dataPagamento ? fmtData(m.dataPagamento) : '—',
      ].join(';'))
    }

    const totalPago = mensalidades.filter(m => m.isPago()).reduce((s, m) => s + m.valor, 0)
    const totalPendente = mensalidades.filter(m => m.isPendente()).reduce((s, m) => s + m.valor, 0)
    linhas.push('')
    linhas.push(`Total pago;;${fmtBRL(totalPago)}`)
    linhas.push(`Total pendente;;${fmtBRL(totalPendente)}`)

    return Buffer.from(BOM + linhas.join('\n'), 'utf-8')
  }

  // ─── MENSALIDADES PDF ────────────────────────────────────────────────────────

  async gerarPdfMensalidades(
    mensalidades: Mensalidade[],
    opcoes: { ano: number; mes?: number },
  ): Promise<Buffer> {
    const nomes = await this.resolverNomes(mensalidades.map(m => m.associadoId))
    const titulo = opcoes.mes
      ? `Mensalidades — ${MESES_PT[opcoes.mes - 1]}/${opcoes.ano}`
      : `Mensalidades — ${opcoes.ano}`

    const totalPago = mensalidades.filter(m => m.isPago()).reduce((s, m) => s + m.valor, 0)
    const totalPendente = mensalidades.filter(m => m.isPendente()).reduce((s, m) => s + m.valor, 0)
    const totalIsento = mensalidades.filter(m => m.isIsento()).length

    const colunas = [
      { label: 'Associado', width: 160 },
      { label: 'Competência', width: 70 },
      { label: 'Valor', width: 70, align: 'right' as const },
      { label: 'Status', width: 60 },
      { label: 'Método', width: 90 },
      { label: 'Dt. Pagamento', width: 80 },
    ]

    const rows = mensalidades.map(m => [
      nomes.get(m.associadoId) ?? m.associadoId,
      m.competenciaLabel,
      fmtBRL(m.valor),
      STATUS_PT[m.status] ?? m.status,
      m.metodoPagamento ? (METODO_PT[m.metodoPagamento] ?? m.metodoPagamento) : '—',
      m.dataPagamento ? fmtData(m.dataPagamento) : '—',
    ])

    const sumario = [
      `Pagas: ${mensalidades.filter(m => m.isPago()).length} (${fmtBRL(totalPago)})`,
      `Pendentes: ${mensalidades.filter(m => m.isPendente()).length} (${fmtBRL(totalPendente)})`,
      `Isentas: ${totalIsento}`,
    ]

    return this.buildPdf(titulo, colunas, rows, sumario)
  }

  // ─── MOVIMENTOS CSV ──────────────────────────────────────────────────────────

  async gerarCsvMovimentos(
    movimentos: MovimentoFinanceiro[],
    opcoes: { titulo?: string } = {},
  ): Promise<Buffer> {
    const nomes = await this.resolverNomes(movimentos.map(m => m.associadoId))

    const linhas: string[] = [
      `Relatório de Movimentos Financeiros${opcoes.titulo ? ' — ' + opcoes.titulo : ''}`,
      `Gerado em;${fmtDataHora(new Date())}`,
      '',
      'Data;Associado;Tipo;Descrição;Campanha;Valor',
    ]

    for (const m of movimentos) {
      linhas.push([
        fmtData(m.data),
        nomes.get(m.associadoId) ?? m.associadoId,
        TIPO_PT[m.tipo] ?? m.tipo,
        m.descricao ?? '—',
        m.campanhaId ?? '—',
        fmtBRL(m.valor),
      ].join(';'))
    }

    const entradas = movimentos.filter(m => m.valor > 0).reduce((s, m) => s + m.valor, 0)
    const saidas = movimentos.filter(m => m.valor < 0).reduce((s, m) => s + Math.abs(m.valor), 0)
    linhas.push('')
    linhas.push(`Entradas;;;;;${fmtBRL(entradas)}`)
    linhas.push(`Saídas;;;;;${fmtBRL(saidas)}`)
    linhas.push(`Saldo;;;;;${fmtBRL(entradas - saidas)}`)

    return Buffer.from(BOM + linhas.join('\n'), 'utf-8')
  }

  // ─── MOVIMENTOS PDF ──────────────────────────────────────────────────────────

  async gerarPdfMovimentos(
    movimentos: MovimentoFinanceiro[],
    opcoes: { titulo?: string } = {},
  ): Promise<Buffer> {
    const nomes = await this.resolverNomes(movimentos.map(m => m.associadoId))
    const titulo = `Movimentos Financeiros${opcoes.titulo ? ' — ' + opcoes.titulo : ''}`

    const entradas = movimentos.filter(m => m.valor > 0).reduce((s, m) => s + m.valor, 0)
    const saidas = movimentos.filter(m => m.valor < 0).reduce((s, m) => s + Math.abs(m.valor), 0)

    const colunas = [
      { label: 'Data', width: 70 },
      { label: 'Associado', width: 140 },
      { label: 'Tipo', width: 80 },
      { label: 'Descrição', width: 130 },
      { label: 'Valor', width: 80, align: 'right' as const },
    ]

    const rows = movimentos.map(m => [
      fmtData(m.data),
      nomes.get(m.associadoId) ?? m.associadoId,
      TIPO_PT[m.tipo] ?? m.tipo,
      m.descricao ?? '—',
      fmtBRL(m.valor),
    ])

    const sumario = [
      `Entradas: ${fmtBRL(entradas)}`,
      `Saídas: ${fmtBRL(saidas)}`,
      `Saldo: ${fmtBRL(entradas - saidas)}`,
    ]

    return this.buildPdf(titulo, colunas, rows, sumario)
  }

  // ─── EXTRATO POR ASSOCIADO ───────────────────────────────────────────────────

  async gerarPdfExtratoAssociado(
    associadoId: string,
    mensalidades: Mensalidade[],
    movimentos: MovimentoFinanceiro[],
    ano: number,
  ): Promise<Buffer> {
    const associado = await this.prisma.associado.findUnique({
      where: { id: associadoId },
      select: { usuario: { select: { nome: true } } },
    })
    const nome = associado?.usuario?.nome ?? associadoId

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' })
      const chunks: Buffer[] = []
      doc.on('data', c => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      this.renderCabecalho(doc, `Extrato do Associado — ${ano}`)
      doc.fontSize(11).text(`Associado: ${nome}`, { continued: false }).moveDown(0.5)

      // Seção mensalidades
      doc.fontSize(11).font('Helvetica-Bold').text('Mensalidades').font('Helvetica').moveDown(0.3)
      const colsM = [
        { label: 'Competência', width: 80 },
        { label: 'Valor', width: 70, align: 'right' as const },
        { label: 'Status', width: 60 },
        { label: 'Método', width: 90 },
        { label: 'Dt. Pagamento', width: 80 },
      ]
      const rowsM = mensalidades.map(m => [
        m.competenciaLabel,
        fmtBRL(m.valor),
        STATUS_PT[m.status] ?? m.status,
        m.metodoPagamento ? (METODO_PT[m.metodoPagamento] ?? m.metodoPagamento) : '—',
        m.dataPagamento ? fmtData(m.dataPagamento) : '—',
      ])
      const totalPago = mensalidades.filter(m => m.isPago()).reduce((s, m) => s + m.valor, 0)
      this.renderTabela(doc, colsM, rowsM)
      doc.fontSize(9).text(`Total pago: ${fmtBRL(totalPago)}`, { align: 'right' }).moveDown(1)

      // Seção movimentos
      doc.fontSize(11).font('Helvetica-Bold').text('Movimentos Financeiros').font('Helvetica').moveDown(0.3)
      const colsV = [
        { label: 'Data', width: 70 },
        { label: 'Tipo', width: 80 },
        { label: 'Descrição', width: 170 },
        { label: 'Valor', width: 80, align: 'right' as const },
      ]
      const rowsV = movimentos.map(m => [
        fmtData(m.data),
        TIPO_PT[m.tipo] ?? m.tipo,
        m.descricao ?? '—',
        fmtBRL(m.valor),
      ])
      const entradas = movimentos.filter(m => m.valor > 0).reduce((s, m) => s + m.valor, 0)
      const saidas = movimentos.filter(m => m.valor < 0).reduce((s, m) => s + Math.abs(m.valor), 0)
      this.renderTabela(doc, colsV, rowsV)
      doc.fontSize(9)
        .text(`Entradas: ${fmtBRL(entradas)}   Saídas: ${fmtBRL(saidas)}   Saldo: ${fmtBRL(entradas - saidas)}`, { align: 'right' })
        .moveDown(1)

      this.renderRodape(doc)
      doc.end()
    })
  }

  // ─── PDF builder genérico ────────────────────────────────────────────────────

  private buildPdf(
    titulo: string,
    colunas: { label: string; width: number; align?: 'left' | 'right' }[],
    rows: string[][],
    sumario: string[],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' })
      const chunks: Buffer[] = []
      doc.on('data', c => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      this.renderCabecalho(doc, titulo)
      this.renderTabela(doc, colunas, rows)

      doc.moveDown(0.5).fontSize(9).font('Helvetica-Bold')
      for (const linha of sumario) doc.text(linha, { align: 'right' })

      this.renderRodape(doc)
      doc.end()
    })
  }

  private renderCabecalho(doc: PDFKit.PDFDocument, titulo: string) {
    doc.fontSize(14).font('Helvetica-Bold').text('Apabee — Associação Pratense de Apicultura', { align: 'center' })
    doc.fontSize(11).font('Helvetica').text(titulo, { align: 'center' }).moveDown(1)
  }

  private renderTabela(
    doc: PDFKit.PDFDocument,
    colunas: { label: string; width: number; align?: 'left' | 'right' }[],
    rows: string[][],
  ) {
    const rowH = 18
    const startX = doc.page.margins.left
    let y = doc.y

    // Cabeçalho
    doc.font('Helvetica-Bold').fontSize(8)
    doc.rect(startX, y, colunas.reduce((s, c) => s + c.width, 0), rowH).fill('#EBEBEB').stroke()
    doc.fillColor('black')
    let x = startX
    for (const col of colunas) {
      doc.text(col.label, x + 3, y + 5, { width: col.width - 6, align: col.align ?? 'left', lineBreak: false })
      x += col.width
    }
    y += rowH

    // Linhas
    doc.font('Helvetica').fontSize(8)
    for (let i = 0; i < rows.length; i++) {
      if (y + rowH > doc.page.height - doc.page.margins.bottom) {
        doc.addPage()
        y = doc.page.margins.top
      }
      if (i % 2 === 1) {
        doc.rect(startX, y, colunas.reduce((s, c) => s + c.width, 0), rowH).fill('#F9F9F9').stroke()
        doc.fillColor('black')
      }
      x = startX
      const row = rows[i]!
      for (let j = 0; j < colunas.length; j++) {
        const col = colunas[j]!
        doc.text(row[j] ?? '', x + 3, y + 5, { width: col.width - 6, align: col.align ?? 'left', lineBreak: false })
        x += col.width
      }
      y += rowH
    }

    doc.y = y
  }

  private renderRodape(doc: PDFKit.PDFDocument) {
    doc.moveDown(1).fontSize(7).fillColor('#888888')
      .text(`Gerado em ${fmtDataHora(new Date())} — Apabee`, { align: 'center' })
    doc.fillColor('black')
  }

  // ─── RELATÓRIO POR CAMPANHA ──────────────────────────────────────────────────

  private async carregarDadosCampanha(campanhaId: string) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id: campanhaId },
      select: { id: true, codigo: true, nome: true, tipo: true, status: true, dataInicio: true, dataFim: true },
    })
    if (!campanha) throw new Error(`Campanha ${campanhaId} não encontrada`)

    const [contribuicoes, custos, ordensProducao, itensVendidos, apuracao] = await Promise.all([
      this.prisma.contribuicao.findMany({
        where: { campanhaId },
        select: { tipo: true, volume: true, valorMonetario: true, descricao: true, associado: { select: { usuario: { select: { nome: true } } } } },
        orderBy: { criadoEm: 'asc' },
      }),
      this.prisma.custoCampanha.findMany({
        where: { campanhaId },
        select: { descricao: true, valor: true, categoria: true, pagoPor: { select: { usuario: { select: { nome: true } } } } },
        orderBy: { criadoEm: 'asc' },
      }),
      this.prisma.ordemProducao.findMany({
        where: { campanhaId },
        select: { quantidade: true, quantidadeReal: true, sobrasRecuperadas: true, status: true, produto: { select: { nome: true } } },
        orderBy: { criadoEm: 'asc' },
      }),
      this.prisma.itemPedido.findMany({
        where: { campanhaCodigo: campanha.codigo },
        select: { quantidade: true, precoUnitario: true, produto: { select: { nome: true } } },
      }),
      this.prisma.apuracaoCampanha.findUnique({
        where: { campanhaId },
        select: {
          faturamentoTotal: true, custoTotal: true, lucroLiquido: true, liquidadoEm: true,
          rateios: {
            select: { contribuicaoTotal: true, percentual: true, valorBruto: true, custosRateados: true, antecipacoes: true, valorFinal: true, associado: { select: { usuario: { select: { nome: true } } } } },
            orderBy: { valorFinal: 'desc' },
          },
        },
      }),
    ])

    return { campanha, contribuicoes, custos, ordensProducao, itensVendidos, apuracao }
  }

  async gerarCsvRelatorioCampanha(campanhaId: string): Promise<Buffer> {
    const { campanha, contribuicoes, custos, ordensProducao, itensVendidos, apuracao } =
      await this.carregarDadosCampanha(campanhaId)

    const linhas: string[] = [
      `Relatório de Campanha — ${campanha.codigo}`,
      campanha.nome,
      `Tipo;${TIPO_CAMPANHA_PT[campanha.tipo] ?? campanha.tipo};Status;${STATUS_CAMPANHA_PT[campanha.status] ?? campanha.status}`,
      `Período;${fmtData(campanha.dataInicio)}${campanha.dataFim ? ' — ' + fmtData(campanha.dataFim) : ' (em andamento)'}`,
      `Gerado em;${fmtDataHora(new Date())}`,
      '',
      'CONTRIBUIÇÕES',
      'Associado;Tipo;Volume (kg);Valor (R$);Descrição',
    ]
    let totalContrib = 0
    for (const c of contribuicoes) {
      const val = Number(c.valorMonetario)
      totalContrib += val
      linhas.push([c.associado?.usuario?.nome ?? '—', TIPO_CONTRIBUICAO_PT[c.tipo] ?? c.tipo, c.volume ? Number(c.volume).toFixed(3) : '—', fmtBRL(val), c.descricao ?? '—'].join(';'))
    }
    linhas.push(`Total;;;;${fmtBRL(totalContrib)}`, '')

    linhas.push('CUSTOS', 'Descrição;Categoria;Pago por;Valor (R$)')
    let totalCustos = 0
    for (const c of custos) {
      const val = Number(c.valor)
      totalCustos += val
      linhas.push([c.descricao, CATEGORIA_CUSTO_PT[c.categoria] ?? c.categoria, c.pagoPor?.usuario?.nome ?? '—', fmtBRL(val)].join(';'))
    }
    linhas.push(`;;;Total;${fmtBRL(totalCustos)}`, '')

    if (campanha.tipo === 'PRODUCAO' && ordensProducao.length > 0) {
      linhas.push('PRODUÇÃO', 'Produto;Qtd Planejada;Qtd Real;Sobras (kg);Status')
      for (const o of ordensProducao) {
        linhas.push([o.produto.nome, String(o.quantidade), o.quantidadeReal != null ? String(o.quantidadeReal) : '—', o.sobrasRecuperadas != null ? Number(o.sobrasRecuperadas).toFixed(3) : '—', STATUS_ORDEM_PT[o.status] ?? o.status].join(';'))
      }
      linhas.push('')
    }

    linhas.push('VENDAS', 'Produto;Qtd;Preço Unit.;Total')
    let totalVendas = 0
    for (const item of itensVendidos) {
      const preco = Number(item.precoUnitario)
      const total = item.quantidade * preco
      totalVendas += total
      linhas.push([item.produto.nome, String(item.quantidade), fmtBRL(preco), fmtBRL(total)].join(';'))
    }
    linhas.push(`;;;Total;${fmtBRL(totalVendas)}`, '')

    if (apuracao) {
      linhas.push(
        'APURAÇÃO E RATEIO',
        `Faturamento Total;;${fmtBRL(Number(apuracao.faturamentoTotal))}`,
        `Custo Total;;${fmtBRL(Number(apuracao.custoTotal))}`,
        `Lucro Líquido;;${fmtBRL(Number(apuracao.lucroLiquido))}`,
        '',
        'Associado;Contrib. Total;%;Valor Bruto;Custos Rateados;Antecipações;Valor Final',
      )
      for (const r of apuracao.rateios) {
        linhas.push([r.associado.usuario.nome, fmtBRL(Number(r.contribuicaoTotal)), (Number(r.percentual) * 100).toFixed(2) + '%', fmtBRL(Number(r.valorBruto)), fmtBRL(Number(r.custosRateados)), fmtBRL(Number(r.antecipacoes)), fmtBRL(Number(r.valorFinal))].join(';'))
      }
    }

    return Buffer.from(BOM + linhas.join('\n'), 'utf-8')
  }

  async gerarPdfRelatorioCampanha(campanhaId: string): Promise<Buffer> {
    const { campanha, contribuicoes, custos, ordensProducao, itensVendidos, apuracao } =
      await this.carregarDadosCampanha(campanhaId)

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' })
      const chunks: Buffer[] = []
      doc.on('data', c => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      this.renderCabecalho(doc, `Relatório de Campanha — ${campanha.codigo}`)
      doc.fontSize(10).font('Helvetica-Bold').text(campanha.nome)
      doc.font('Helvetica').fontSize(9)
        .text(`Tipo: ${TIPO_CAMPANHA_PT[campanha.tipo] ?? campanha.tipo}   Status: ${STATUS_CAMPANHA_PT[campanha.status] ?? campanha.status}`)
        .text(`Período: ${fmtData(campanha.dataInicio)}${campanha.dataFim ? ' — ' + fmtData(campanha.dataFim) : ' (em andamento)'}`)
        .moveDown(1)

      // Seção 1 — Contribuições
      doc.fontSize(11).font('Helvetica-Bold').text(`Contribuições (${contribuicoes.length})`).font('Helvetica').moveDown(0.3)
      if (contribuicoes.length === 0) {
        doc.fontSize(9).text('Nenhuma contribuição registrada.').moveDown(0.5)
      } else {
        const colsC = [
          { label: 'Associado', width: 175 },
          { label: 'Tipo', width: 70 },
          { label: 'Volume (kg)', width: 90, align: 'right' as const },
          { label: 'Valor (R$)', width: 90, align: 'right' as const },
          { label: 'Descrição', width: 90 },
        ]
        const rowsC = contribuicoes.map(c => [c.associado?.usuario?.nome ?? '—', TIPO_CONTRIBUICAO_PT[c.tipo] ?? c.tipo, c.volume ? Number(c.volume).toFixed(3) : '—', fmtBRL(Number(c.valorMonetario)), c.descricao ?? '—'])
        const totalContrib = contribuicoes.reduce((s, c) => s + Number(c.valorMonetario), 0)
        this.renderTabela(doc, colsC, rowsC)
        doc.fontSize(9).text(`Total: ${fmtBRL(totalContrib)}`, { align: 'right' }).moveDown(1)
      }

      // Seção 2 — Custos
      doc.fontSize(11).font('Helvetica-Bold').text(`Custos (${custos.length})`).font('Helvetica').moveDown(0.3)
      if (custos.length === 0) {
        doc.fontSize(9).text('Nenhum custo registrado.').moveDown(0.5)
      } else {
        const colsCusto = [
          { label: 'Descrição', width: 180 },
          { label: 'Categoria', width: 110 },
          { label: 'Pago por', width: 130 },
          { label: 'Valor (R$)', width: 95, align: 'right' as const },
        ]
        const rowsCusto = custos.map(c => [c.descricao, CATEGORIA_CUSTO_PT[c.categoria] ?? c.categoria, c.pagoPor?.usuario?.nome ?? '—', fmtBRL(Number(c.valor))])
        const totalCustos = custos.reduce((s, c) => s + Number(c.valor), 0)
        this.renderTabela(doc, colsCusto, rowsCusto)
        doc.fontSize(9).text(`Total: ${fmtBRL(totalCustos)}`, { align: 'right' }).moveDown(1)
      }

      // Seção 3 — Produção (PRODUCAO only)
      if (campanha.tipo === 'PRODUCAO') {
        doc.fontSize(11).font('Helvetica-Bold').text(`Produção (${ordensProducao.length} ordens)`).font('Helvetica').moveDown(0.3)
        if (ordensProducao.length === 0) {
          doc.fontSize(9).text('Nenhuma ordem de produção registrada.').moveDown(0.5)
        } else {
          const colsO = [
            { label: 'Produto', width: 200 },
            { label: 'Qtd Planejada', width: 90, align: 'right' as const },
            { label: 'Qtd Real', width: 80, align: 'right' as const },
            { label: 'Sobras (kg)', width: 80, align: 'right' as const },
            { label: 'Status', width: 65 },
          ]
          const rowsO = ordensProducao.map(o => [o.produto.nome, String(o.quantidade), o.quantidadeReal != null ? String(o.quantidadeReal) : '—', o.sobrasRecuperadas != null ? Number(o.sobrasRecuperadas).toFixed(3) : '—', STATUS_ORDEM_PT[o.status] ?? o.status])
          this.renderTabela(doc, colsO, rowsO)
          doc.moveDown(1)
        }
      }

      // Seção 4 — Vendas
      doc.fontSize(11).font('Helvetica-Bold').text(`Vendas — Itens de Pedidos (${itensVendidos.length})`).font('Helvetica').moveDown(0.3)
      if (itensVendidos.length === 0) {
        doc.fontSize(9).text('Nenhuma venda registrada para esta campanha.').moveDown(0.5)
      } else {
        const colsV = [
          { label: 'Produto', width: 270 },
          { label: 'Qtd', width: 55, align: 'right' as const },
          { label: 'Preço Unit.', width: 95, align: 'right' as const },
          { label: 'Total', width: 95, align: 'right' as const },
        ]
        const rowsV = itensVendidos.map(item => { const p = Number(item.precoUnitario); return [item.produto.nome, String(item.quantidade), fmtBRL(p), fmtBRL(item.quantidade * p)] })
        const totalVendas = itensVendidos.reduce((s, i) => s + i.quantidade * Number(i.precoUnitario), 0)
        this.renderTabela(doc, colsV, rowsV)
        doc.fontSize(9).text(`Total: ${fmtBRL(totalVendas)}`, { align: 'right' }).moveDown(1)
      }

      // Seção 5 — Apuração e Rateio
      if (apuracao) {
        doc.fontSize(11).font('Helvetica-Bold').text('Apuração e Rateio').font('Helvetica').moveDown(0.3)
        doc.fontSize(9)
          .text(`Faturamento Total: ${fmtBRL(Number(apuracao.faturamentoTotal))}   Custo Total: ${fmtBRL(Number(apuracao.custoTotal))}   Lucro Líquido: ${fmtBRL(Number(apuracao.lucroLiquido))}`)
          .moveDown(0.5)
        const colsR = [
          { label: 'Associado', width: 130 },
          { label: 'Contrib. Total', width: 80, align: 'right' as const },
          { label: '%', width: 45, align: 'right' as const },
          { label: 'Valor Bruto', width: 75, align: 'right' as const },
          { label: 'Custos Rat.', width: 70, align: 'right' as const },
          { label: 'Antecip.', width: 60, align: 'right' as const },
          { label: 'Valor Final', width: 55, align: 'right' as const },
        ]
        const rowsR = apuracao.rateios.map(r => [r.associado.usuario.nome, fmtBRL(Number(r.contribuicaoTotal)), (Number(r.percentual) * 100).toFixed(2) + '%', fmtBRL(Number(r.valorBruto)), fmtBRL(Number(r.custosRateados)), fmtBRL(Number(r.antecipacoes)), fmtBRL(Number(r.valorFinal))])
        this.renderTabela(doc, colsR, rowsR)
        doc.moveDown(1)
      }

      this.renderRodape(doc)
      doc.end()
    })
  }
}
