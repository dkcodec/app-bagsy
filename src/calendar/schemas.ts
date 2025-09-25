import { z } from "zod";

export const eventSchema = z.object({
  user: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z
    .date()
    .refine(val => !!val, { message: "Start date is required" }),
  startTime: z.object({ hour: z.number(), minute: z.number() }),
  endDate: z.date().refine(val => !!val, { message: "End date is required" }),
  endTime: z.object({ hour: z.number(), minute: z.number() }),
  color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"]),
});

export type TEventFormData = z.infer<typeof eventSchema>;
