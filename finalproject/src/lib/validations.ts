import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .max(2000, "Content must be less than 2000 characters")
    .optional(),
  image_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  link_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  flags: z.array(z.string()).optional().default([]),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .min(3, "Comment must be at least 3 characters")
    .max(500, "Comment must be less than 500 characters"),
});

export type CreatePostData = z.infer<typeof createPostSchema>;
export type CommentData = z.infer<typeof commentSchema>;
