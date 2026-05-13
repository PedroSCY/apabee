import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Produto, ICriarProdutoUseCase, CriarProdutoInput, IProdutoRepository } from '@apa/core'
import { StatusProduto } from '@apa/shared'
import { PRODUTO_REPOSITORY } from '../../catalogo.tokens'

function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

@Injectable()
/** Cria um novo produto em status rascunho com slug único. */
export class CriarProdutoUseCase implements ICriarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  /** Executa a criação validando slug e persiste o produto. */
  async execute(input: CriarProdutoInput): Promise<Produto> {
    const slug = input.slug?.trim() || toSlug(input.nome)

    const existing = await this.produtoRepository.findBySlug(slug)
    if (existing) throw new ConflictException(`Slug "${slug}" já está em uso.`)

    const produto = new Produto({
      id: randomUUID(),
      nome: input.nome.trim(),
      slug,
      descricao: input.descricao.trim(),
      preco: input.preco,
      imagemUrl: input.imagemUrl?.trim(),
      status: StatusProduto.RASCUNHO,
      loteOrigemId: input.loteOrigemId,
      criadoEm: new Date(),
    })

    return this.produtoRepository.save(produto)
  }
}
