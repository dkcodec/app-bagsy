"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useDisclosure, useCreateBagsie } from "@/src/shared/hooks";
import { useCalendar } from "@/src/features/calendar/calendar-context";
import { toTimestampWithTz } from "@/src/shared/utils/formater";

import { Input } from "@/src/entities/input";
import { Button } from "@/src/entities/button";
import { Textarea } from "@/src/entities/textarea";
import { TimeInput } from "@/src/entities/time-input";
import { SingleDayPicker } from "@/src/entities/single-day-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/entities/avatar";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/src/entities/form";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import {
  Dialog,
  DialogHeader,
  DialogClose,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "@/src/entities/dialog";

import { eventSchema, type TEventFormData } from "@/src/shared/schemas";
import { useTranslations } from "next-intl";

import type { TimeValue } from "react-aria-components";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  /** Код точки (для CreateBagsieRequestDto.provider.point_code). */
  pointCode?: string;
}

export function AddEventDialog({
  children,
  startDate,
  startTime,
  pointCode,
}: IProps) {
  const { masters } = useCalendar();
  const t = useTranslations("Dashboard.Calendar.AddEventDialog");
  const createBagsie = useCreateBagsie();

  const { isOpen, onClose, onToggle } = useDisclosure();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      user: "",
      title: "",
      first_name: "",
      last_name: "",
      phone: "",
      comment: "",
      startDate: typeof startDate !== "undefined" ? startDate : undefined,
      startTime: typeof startTime !== "undefined" ? startTime : undefined,
      endDate: typeof startDate !== "undefined" ? startDate : new Date(),
      endTime:
        typeof startTime !== "undefined"
          ? { hour: Math.min(23, startTime.hour + 1), minute: startTime.minute }
          : { hour: 10, minute: 0 },
      color: "blue",
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(values.startTime.hour, values.startTime.minute);
    const endDateTime = new Date(values.endDate);
    endDateTime.setHours(values.endTime.hour, values.endTime.minute);
    const start_at = toTimestampWithTz(startDateTime);
    const end_at = toTimestampWithTz(endDateTime);

    try {
      await createBagsie.mutateAsync({
        description: values.comment ?? "",
        end_at,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        provider: { phone: values.user, point_code: pointCode ?? "" },
        service: values.title,
        start_at,
      });
      onClose();
      form.reset();
    } catch {
      toast.error(t("errorCreating") ?? "Ошибка при создании записи");
    }
  };

  useEffect(() => {
    form.reset({
      startDate,
      startTime,
      endDate: startDate,
      endTime:
        startTime != null
          ? { hour: Math.min(23, startTime.hour + 1), minute: startTime.minute }
          : { hour: 10, minute: 0 },
    });
  }, [startDate, startTime, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="event-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid sm:grid-cols-2 gap-4 py-4 px-1 max-h-[400px] md:max-h-none overflow-y-auto"
          >
            <FormField
              control={form.control}
              name="user"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("staff")}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t("staffDescription")} />
                      </SelectTrigger>

                      <SelectContent>
                        {masters.map(master => (
                          <SelectItem
                            key={master.phone}
                            value={master.phone}
                            className="flex-1"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar key={master.phone} className="size-6">
                                <AvatarImage
                                  src={undefined}
                                  alt={`${master.name} ${master.surname}`}
                                />
                                <AvatarFallback className="text-xxs">
                                  {`${master.name[0]}${master.surname[0]}`}
                                </AvatarFallback>
                              </Avatar>

                              <p className="truncate">
                                {master.name} {master.surname}
                              </p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="title">{t("service")}</FormLabel>

                  <FormControl>
                    <Input
                      id="title"
                      placeholder={t("serviceDescription")}
                      data-invalid={fieldState.invalid}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("firstName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("firstName")}
                        data-invalid={fieldState.invalid}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("lastName")}
                        data-invalid={fieldState.invalid}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("phone")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("phone")}
                        data-invalid={fieldState.invalid}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel htmlFor="startDate">{t("startDate")}</FormLabel>

                    <FormControl>
                      <SingleDayPicker
                        id="startDate"
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder={t("startDateDescription")}
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("startTime")}</FormLabel>

                    <FormControl>
                      <TimeInput
                        value={field.value as TimeValue}
                        onChange={field.onChange}
                        hourCycle={24}
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("endDate")}</FormLabel>
                    <FormControl>
                      <SingleDayPicker
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder={t("endDateDescription")}
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-nowrap">
                      {t("endTime")}
                    </FormLabel>

                    <FormControl>
                      <TimeInput
                        value={field.value as TimeValue}
                        onChange={field.onChange}
                        hourCycle={24}
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("Color.title")}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t("Color.description")} />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="blue">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-blue-600" />
                            {t("Color.blue")}
                          </div>
                        </SelectItem>

                        <SelectItem value="green">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-green-600" />
                            {t("Color.green")}
                          </div>
                        </SelectItem>

                        <SelectItem value="red">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-red-600" />
                            {t("Color.red")}
                          </div>
                        </SelectItem>

                        <SelectItem value="yellow">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-yellow-600" />
                            {t("Color.yellow")}
                          </div>
                        </SelectItem>

                        <SelectItem value="purple">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-purple-600" />
                            {t("Color.purple")}
                          </div>
                        </SelectItem>

                        <SelectItem value="orange">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-orange-600" />
                            {t("Color.orange")}
                          </div>
                        </SelectItem>

                        <SelectItem value="gray">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-neutral-600" />
                            {t("Color.gray")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("comment")}</FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("commentDescription")}
                      value={field.value}
                      data-invalid={fieldState.invalid}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="flex gap-3">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </DialogClose>

          <Button form="event-form" type="submit">
            {t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
