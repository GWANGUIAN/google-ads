import { defineCollection, z } from "astro:content";

const guides = defineCollection({
  type: "content",
  schema: z.object({
    lang: z.enum(["ko", "en"]),
    title: z.string(),
    description: z.string(),
    updated: z.date(),
    order: z.number(),
  }),
});

export const collections = { guides };
