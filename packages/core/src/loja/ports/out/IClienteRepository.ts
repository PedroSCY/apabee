import { Cliente } from '../../entities/Cliente'
import { EnderecoEntrega } from '../../entities/EnderecoEntrega'

export interface IClienteRepository {
  findById(id: string): Promise<Cliente | null>
  findByEmail(email: string): Promise<Cliente | null>
  findAll(): Promise<Cliente[]>
  save(cliente: Cliente): Promise<Cliente>
  update(cliente: Cliente): Promise<Cliente>

  findEnderecosByClienteId(clienteId: string): Promise<EnderecoEntrega[]>
  findEnderecoById(id: string): Promise<EnderecoEntrega | null>
  saveEndereco(endereco: EnderecoEntrega): Promise<EnderecoEntrega>
  updateEndereco(endereco: EnderecoEntrega): Promise<EnderecoEntrega>
  deleteEndereco(id: string): Promise<void>
  desmarcarTodosPrincipais(clienteId: string): Promise<void>
}
