"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaDocumento = exports.StatusPedido = exports.TipoMovimentoFinanceiro = exports.TipoVenda = exports.TipoLote = exports.TipoMovimentacao = exports.UnidadeMedida = exports.TipoPatrimonio = exports.CategoriaInsumo = exports.StatusAtribuicao = exports.RoleUsuario = void 0;
var RoleUsuario;
(function (RoleUsuario) {
    RoleUsuario["ADMIN"] = "ADMIN";
    RoleUsuario["ASSOCIADO"] = "ASSOCIADO";
})(RoleUsuario || (exports.RoleUsuario = RoleUsuario = {}));
var StatusAtribuicao;
(function (StatusAtribuicao) {
    StatusAtribuicao["ATIVO"] = "ATIVO";
    StatusAtribuicao["DEVOLVIDO"] = "DEVOLVIDO";
})(StatusAtribuicao || (exports.StatusAtribuicao = StatusAtribuicao = {}));
var CategoriaInsumo;
(function (CategoriaInsumo) {
    CategoriaInsumo["FERRAMENTA"] = "FERRAMENTA";
    CategoriaInsumo["INSUMO"] = "INSUMO";
})(CategoriaInsumo || (exports.CategoriaInsumo = CategoriaInsumo = {}));
var TipoPatrimonio;
(function (TipoPatrimonio) {
    TipoPatrimonio["EQUIPAMENTO"] = "EQUIPAMENTO";
    TipoPatrimonio["INSUMO"] = "INSUMO";
})(TipoPatrimonio || (exports.TipoPatrimonio = TipoPatrimonio = {}));
var UnidadeMedida;
(function (UnidadeMedida) {
    UnidadeMedida["KG"] = "KG";
    UnidadeMedida["LITRO"] = "LITRO";
    UnidadeMedida["UNIDADE"] = "UNIDADE";
    UnidadeMedida["GRAMA"] = "GRAMA";
})(UnidadeMedida || (exports.UnidadeMedida = UnidadeMedida = {}));
var TipoMovimentacao;
(function (TipoMovimentacao) {
    TipoMovimentacao["ENTRADA"] = "ENTRADA";
    TipoMovimentacao["SAIDA"] = "SAIDA";
})(TipoMovimentacao || (exports.TipoMovimentacao = TipoMovimentacao = {}));
var TipoLote;
(function (TipoLote) {
    TipoLote["PRODUCAO"] = "PRODUCAO";
    TipoLote["AQUISICAO"] = "AQUISICAO";
})(TipoLote || (exports.TipoLote = TipoLote = {}));
var TipoVenda;
(function (TipoVenda) {
    TipoVenda["COLETIVA"] = "COLETIVA";
    TipoVenda["INDIVIDUAL"] = "INDIVIDUAL";
})(TipoVenda || (exports.TipoVenda = TipoVenda = {}));
var TipoMovimentoFinanceiro;
(function (TipoMovimentoFinanceiro) {
    TipoMovimentoFinanceiro["ANTECIPACAO"] = "ANTECIPACAO";
    TipoMovimentoFinanceiro["RATEIO_FINAL"] = "RATEIO_FINAL";
})(TipoMovimentoFinanceiro || (exports.TipoMovimentoFinanceiro = TipoMovimentoFinanceiro = {}));
var StatusPedido;
(function (StatusPedido) {
    StatusPedido["PENDENTE"] = "PENDENTE";
    StatusPedido["CONFIRMADO"] = "CONFIRMADO";
    StatusPedido["EM_PREPARO"] = "EM_PREPARO";
    StatusPedido["ENVIADO"] = "ENVIADO";
    StatusPedido["ENTREGUE"] = "ENTREGUE";
    StatusPedido["CANCELADO"] = "CANCELADO";
})(StatusPedido || (exports.StatusPedido = StatusPedido = {}));
var CategoriaDocumento;
(function (CategoriaDocumento) {
    CategoriaDocumento["ATA"] = "ATA";
    CategoriaDocumento["FINANCEIRO"] = "FINANCEIRO";
    CategoriaDocumento["PRESTACAO_CONTAS"] = "PRESTACAO_CONTAS";
    CategoriaDocumento["RELATORIO"] = "RELATORIO";
    CategoriaDocumento["OUTRO"] = "OUTRO";
})(CategoriaDocumento || (exports.CategoriaDocumento = CategoriaDocumento = {}));
//# sourceMappingURL=index.js.map