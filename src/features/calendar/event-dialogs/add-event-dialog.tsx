"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDisclosure } from "@/src/shared/hooks";
import { useCalendar } from "@/src/features/calendar/calendar-context";

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
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { users } = useCalendar();
  const t = useTranslations("Dashboard.Calendar.AddEventDialog");

  // const createBagsie = useCreateBagsie();

  const { isOpen, onClose, onToggle } = useDisclosure();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      comment: "",
      startDate: typeof startDate !== "undefined" ? startDate : undefined,
      startTime: typeof startTime !== "undefined" ? startTime : undefined,
    },
  });

  const onSubmit = () => {
    console.log(form.getValues());
    onClose();
    form.reset();
  };

  useEffect(() => {
    form.reset({
      startDate,
      startTime,
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
                        {users.map(user => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            className="flex-1"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar key={user.id} className="size-6">
                                <AvatarImage
                                  src={user.picturePath ?? undefined}
                                  alt={user.name}
                                />
                                <AvatarFallback className="text-xxs">
                                  {user.name[0]}
                                </AvatarFallback>
                              </Avatar>

                              <p className="truncate">{user.name}</p>
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
