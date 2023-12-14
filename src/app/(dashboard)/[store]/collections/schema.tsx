import { z } from "zod";

export const collectionSchema = z.object({
  name: z.string().min(1, "Sua coleção precisa de um nome."),
  slug: z.string().min(1, "Sua coleção precisa de uma slug"),
  description: z.string().optional(),
  parents: z.array(z.number()).default([]),
});

export type CollectionSchema = z.infer<typeof collectionSchema>;
