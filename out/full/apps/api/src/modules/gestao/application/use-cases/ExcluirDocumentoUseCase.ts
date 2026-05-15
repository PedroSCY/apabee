import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IDocumentoRepository, IExcluirDocumentoUseCase, IStoragePort } from '@apa/core'
import { DOCUMENTO_REPOSITORY, STORAGE_PORT } from '../../gestao.tokens'

@Injectable()
export class ExcluirDocumentoUseCase implements IExcluirDocumentoUseCase {
  constructor(
    @Inject(DOCUMENTO_REPOSITORY) private readonly repository: IDocumentoRepository,
    @Inject(STORAGE_PORT) private readonly storage: IStoragePort,
  ) {}

  async execute(id: string): Promise<void> {
    const doc = await this.repository.findById(id)
    if (!doc) throw new NotFoundException('Documento não encontrado')

    // Extrai o caminho relativo da URL (tudo após /storage/v1/object/public/<bucket>/)
    try {
      const url = new URL(doc.arquivoUrl)
      const pathParts = url.pathname.split('/documentos/')
      if (pathParts[1]) await this.storage.excluir(pathParts[1])
    } catch {
      // Storage deletion is best-effort in MVP — DB record is always removed
    }

    await this.repository.delete(id)
  }
}
