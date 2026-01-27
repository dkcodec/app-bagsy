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

/** Схема для создания записи POST /api/v1/bagsies/master */
export const addBagsieSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  client_phone: z.string().min(1, "Phone is required"),
  comment: z.string().optional(),
  /** Для STAFF не в форме — подставляется phone текущего пользователя. Для manager+ — выбор из /staff. */
  master_phone: z.string().optional(),
  service_id: z.string().min(1, "Service is required"),
  startDate: z
    .date()
    .refine(val => !!val, { message: "Start date is required" }),
  startTime: z.object({ hour: z.number(), minute: z.number() }),
});

export type TAddBagsieFormData = z.infer<typeof addBagsieSchema>;
