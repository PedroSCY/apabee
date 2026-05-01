import { z } from 'zod';
export declare const UUIDSchema: z.ZodUUID;
export declare const EmailSchema: z.ZodEmail;
export declare const PercentualSchema: z.ZodNumber;
export declare const VolumeSchema: z.ZodNumber;
export declare const PrecoSchema: z.ZodNumber;
export declare const PeriodoSchema: z.ZodObject<{
    dataInicio: z.ZodCoercedDate<unknown>;
    dataFim: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map