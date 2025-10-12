import { z } from "zod";

export const eventSchema = z.object({
  user: z.string(),
  // service name selected from a list (for now free text)
  title: z.string().min(1, "Title is required"),
  // customer info
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  comment: z.string().optional(),
  startDate: z
    .date()
    .refine(val => !!val, { message: "Start date is required" }),
  startTime: z.object({ hour: z.number(), minute: z.number() }),
  endDate: z.date().refine(val => !!val, { message: "End date is required" }),
  endTime: z.object({ hour: z.number(), minute: z.number() }),
  color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"]),
});

export type TEventFormData = z.infer<typeof eventSchema>;
