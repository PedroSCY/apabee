import { Usuario } from "../../entities";

export interface IUsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  save(usuario: Usuario): Promise<Usuario>;
  update(usuario: Usuario): Promise<Usuario>;
  delete(id: string): Promise<void>;
  contemRegistrosDeAutoria(id: string): Promise<boolean>;
}
