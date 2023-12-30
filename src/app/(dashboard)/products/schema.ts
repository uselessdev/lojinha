import { z } from "zod";

const status = z.enum(["ACTIVE", "DRAFT", "VALIDATION", "DISABLED"]);

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: status.default("DRAFT"),
  collections: z.array(z.number()).default([]),
  description: z.string().optional(),
  price: z.string().optional(),
  originalPrice: z.string().optional(),
  quantity: z.number().optional(),
  sku: z.string().optional(),
  variants: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
        values: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  options: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        quantity: z.number().optional(),
        sku: z.string().optional(),
      }),
    )
    .default([]),
});

export type ProductSchema = z.infer<typeof productSchema>;

export const updateProductSchema = productSchema.required({ id: true });
