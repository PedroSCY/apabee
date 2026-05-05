import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IAtualizarProdutoUseCase, AtualizarProdutoInput, IProdutoRepository, Produto } from '@apa/core'
import { PRODUTO_REPOSITORY } from '../../catalogo.tokens'

@Injectable()
export class AtualizarProdutoUseCase implements IAtualizarProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: AtualizarProdutoInput): Promise<Produto> {
    const produto = await this.produtoRepository.findById(input.produtoId)
    if (!produto) throw new NotFoundException(`Produto ${input.produtoId} não encontrado.`)

    if (input.slug && input.slug !== produto.slug) {
      const existing = await this.produtoRepository.findBySlug(input.slug)
      if (existing) throw new ConflictException(`Slug "${input.slug}" já está em uso.`)
    }

    const atualizado = new Produto({
      id: produto.id,
      nome: input.nome?.trim() ?? produto.nome,
      slug: input.slug?.trim() ?? produto.slug,
      descricao: input.descricao?.trim() ?? produto.descricao,
      preco: input.preco ?? produto.preco,
      imagemUrl: input.imagemUrl?.trim() ?? produto.imagemUrl,
      status: produto.status,
      loteOrigemId: produto.loteOrigemId,
      criadoEm: produto.criadoEm,
    })

    return this.produtoRepository.update(atualizado)
  }
}
