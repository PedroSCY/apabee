import { RoleUsuario } from "@repo/shared";
import { Usuario } from "./usuario";

const makeUsuario = (overrides = {}) =>
  new Usuario({
    id: 'uuid-1',
    nome: 'João Silva',
    email: 'joao@apa.com',
    role: RoleUsuario.ASSOCIADO,
    ativo: true,
    criadoEm: new Date(),
    ...overrides,
  });

describe('Usuario', () => {
  it('deve identificar admin corretamente', () => {
    const admin = makeUsuario({ role: RoleUsuario.ADMIN });
    expect(admin.isAdmin()).toBe(true);
    expect(admin.isAssociado()).toBe(false);
  });

  it('deve identificar associado corretamente', () => {
    const associado = makeUsuario();
    expect(associado.isAssociado()).toBe(true);
    expect(associado.isAdmin()).toBe(false);
  });

  it('ativar deve retornar novo Usuario com ativo=true', () => {
    const inativo = makeUsuario({ ativo: false });
    const ativo = inativo.ativar();
    expect(ativo.ativo).toBe(true);
    expect(inativo.ativo).toBe(false); 
  });

  it('desativar deve retornar novo Usuario com ativo=false', () => {
    const ativo = makeUsuario({ ativo: true });
    const inativo = ativo.desativar();
    expect(inativo.ativo).toBe(false);
    expect(ativo.ativo).toBe(true);
  });

  it('alterarRole deve retornar novo Usuario com role atualizada', () => {
    const associado = makeUsuario();
    const admin = associado.alterarRole(RoleUsuario.ADMIN);
    expect(admin.role).toBe(RoleUsuario.ADMIN);
    expect(associado.role).toBe(RoleUsuario.ASSOCIADO);
  });
});
