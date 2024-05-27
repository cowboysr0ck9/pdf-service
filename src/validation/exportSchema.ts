import { z } from "zod";

export const types = ["Account_Group", "Account"] as const;

export const parameter = z.object({
  value: z.string(),
  id: z.string().uuid(),
  dataTypeCode: z.string(),
  type: z.enum(types).nullable(),
});

export const exportSchema = z
  .object({
    isApply: z.boolean(),
    reportId: z.string().uuid(),
    parameters: z.array(parameter),
  })
  .required();

export type IExportRequestSchema = z.infer<typeof exportSchema>;

const mockReq: IExportRequestSchema = {
  isApply: false,
  parameters: [],
  reportId: crypto.randomUUID(),
};
