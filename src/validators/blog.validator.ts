import { z } from "zod";

export const blogSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters"),
  content: z.string()
    .min(10, "Content must be at least 10 characters long"),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  readingTime: z.string().optional(),
});
