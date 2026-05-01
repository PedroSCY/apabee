"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodoSchema = exports.PrecoSchema = exports.VolumeSchema = exports.PercentualSchema = exports.EmailSchema = exports.UUIDSchema = void 0;
const zod_1 = require("zod");
exports.UUIDSchema = zod_1.z.uuid();
exports.EmailSchema = zod_1.z.email();
exports.PercentualSchema = zod_1.z
    .number()
    .min(0, 'Percentual não pode ser negativo')
    .max(100, 'Percentual não pode exceder 100');
exports.VolumeSchema = zod_1.z
    .number()
    .positive('Volume deve ser maior que zero');
exports.PrecoSchema = zod_1.z
    .number()
    .positive('Preço deve ser maior que zero')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais');
exports.PeriodoSchema = zod_1.z
    .object({
    dataInicio: zod_1.z.coerce.date(),
    dataFim: zod_1.z.coerce.date(),
})
    .refine((p) => p.dataFim >= p.dataInicio, {
    message: 'dataFim deve ser maior ou igual a dataInicio',
});
//# sourceMappingURL=index.js.map