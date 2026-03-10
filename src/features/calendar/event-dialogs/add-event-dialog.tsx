"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useDisclosure, useCreateBooking } from "@/src/shared/hooks";
import { useLocationServices } from "@/src/shared/hooks/use-services";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useCalendar } from "@/src/features/calendar/calendar-context";
import { toTimestampWithTz } from "@/src/shared/utils/formater";
import { EUserRole } from "@/src/shared/types/user";

import { Input } from "@/src/entities/input";
import { Button } from "@/src/entities/button";
import { Textarea } from "@/src/entities/textarea";
import { TimeInput } from "@/src/entities/time-input";
import { SingleDayPicker } from "@/src/entities/single-day-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/entities/avatar";
import { Skeleton } from "@/src/entities/skeleton";
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

import { addBookingSchema, type TAddBookingFormData } from "@/src/shared/schemas";
import { useTranslations } from "next-intl";

import type { TimeValue } from "react-aria-components";
import { PhoneInput } from "@/src/widgets";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { masters, locationId } = useCalendar();
  const { data: currentUser } = useCurrentUser();
  const { data: servicesData, isLoading: isLoadingServices } =
    useLocationServices(locationId);
  const t = useTranslations("Dashboard.Calendar.AddEventDialog");
  const createBooking = useCreateBooking();

  const { isOpen, onClose, onToggle } = useDisclosure();
  const isStaff = currentUser?.role === EUserRole.STAFF;
  // manager и выше: выбор мастера из employees; для STAFF — только свой id (поле скрыто)
  const showMasterSelect = !isStaff && masters.length > 0;

  const form = useForm<TAddBookingFormData>({
    resolver: zodResolver(addBookingSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      comment: "",
      employee_id: showMasterSelect ? "" : undefined,
      service_id: "",
      startDate: startDate ?? new Date(),
      startTime: startTime ?? { hour: 10, minute: 0 },
    },
  });

  const onSubmit = async (values: TAddBookingFormData) => {
    const employeeId = isStaff ? currentUser?.id : values.employee_id;
    if (!employeeId) {
      toast.error(t("staffDescription") ?? "Выберите мастера");
      return;
    }
    if (!locationId) {
      toast.error("Выберите точку");
      return;
    }
    const d = new Date(values.startDate);
    d.setHours(values.startTime.hour, values.startTime.minute, 0, 0);
    const start_at = toTimestampWithTz(d);

    try {
      await createBooking.mutateAsync({
        phone: values.phone,
        first_name: values.first_name,
        last_name: values.last_name,
        comment: values.comment ?? "",
        employee_id: employeeId,
        location_id: locationId,
        service_id: values.service_id,
        start_at,
      });
      onClose();
      form.reset();
    } catch {
      toast.error(t("errorCreating") ?? "Ошибка при создании записи");
    }
  };

  // Обновляем дату/время при открытии из ячейки с другими startDate/startTime
  useEffect(() => {
    if (startDate != null) form.setValue("startDate", startDate);
    if (startTime != null) form.setValue("startTime", startTime);
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
            {/* Мастер: для manager+ — выбор из employees; для STAFF — только свой id (скрыто) */}
            {showMasterSelect && (
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("staff")}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger data-invalid={fieldState.invalid}>
                          <SelectValue placeholder={t("staffDescription")} />
                        </SelectTrigger>
                        <SelectContent>
                          {masters.map(master => (
                            <SelectItem
                              key={master.id}
                              value={master.id}
                              className="flex-1"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage
                                    src={master.avatar_url}
                                    alt={`${master.first_name} ${master.last_name}`}
                                  />
                                  <AvatarFallback className="text-xxs">
                                    {`${master.first_name[0]}${master.last_name[0]}`}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="truncate">
                                  {master.first_name} {master.last_name}
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
            )}

            {/* Услуга: select из /services по locationId */}
            <FormField
              control={form.control}
              name="service_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="service_id">{t("service")}</FormLabel>
                  <FormControl>
                    {isLoadingServices ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!locationId}
                      >
                        <SelectTrigger data-invalid={fieldState.invalid}>
                          <SelectValue
                            placeholder={
                              locationId
                                ? t("serviceDescription")
                                : "Сначала выберите точку"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {servicesData?.services
                            ?.filter(s => s.active)
                            .map(s => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-2">
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
                      <PhoneInput
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

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex-1">
                      <FormLabel htmlFor="startDate">
                        {t("startDate")}
                      </FormLabel>
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

              <FormField
                control={form.control}
                name="comment"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel>{t("comment")}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="flex-1"
                        {...field}
                        placeholder={t("commentDescription")}
                        value={field.value ?? ""}
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
