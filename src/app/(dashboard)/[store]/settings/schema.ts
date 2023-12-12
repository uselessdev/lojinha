import { z } from "zod";
import * as CNPJ from "@fnando/cnpj";

export const settingsSchema = z.object({
  name: z.string().min(1, "Você precisa informar o nome da sua loja."),
  url: z.string().url().optional(),
  cnpj: z.string().refine((value: string) => CNPJ.isValid(value), "Informe um CNPJ válido."),
  emails: z.array(z.string()).default([]),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
