"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { TimeValue } from "react-aria-components";

import { useCreateAppointment } from "@/src/shared/hooks";
import { useLocationServices } from "@/src/shared/hooks/use-services";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import {
  useGetEmployeeServices,
  useServiceStaffMap,
} from "@/src/shared/hooks/user-staff";
import { useCalendar } from "@/src/features/calendar/calendar-context";
import { toTimestampWithTz } from "@/src/shared/utils/formater";
import { getApiErrorKey } from "@/src/shared/utils/api-error";
import { EUserRole, type TUserRole } from "@/src/shared/types/user";
import {
  createAddAppointmentSchema,
  type TAddAppointmentFormData,
} from "@/src/shared/schemas";

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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/src/entities/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/src/entities/drawer";

import { PhoneInput } from "@/src/widgets";
import { EVENT_COLOR_BG, TEventColor } from "@/src/shared";

interface AddEventDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

/**
 * Drawer для создания записи
 * Десктоп: Sheet справа
 * Мобилка: Vaul bottom-sheet
 */
export function AddEventDrawer({
  open,
  onOpenChange,
  startDate,
  startTime,
}: AddEventDrawerProps) {
  const { masters, locationId } = useCalendar();
  const { data: currentUser } = useCurrentUser();
  const { data: servicesData, isLoading: isLoadingServices } =
    useLocationServices(locationId);
  const t = useTranslations("Dashboard.Calendar.AddEventDialog");
  // Root-перевод для apiErrors.* (бэк отдаёт стабильные ключи в body.error)
  const tRoot = useTranslations();
  const createAppointment = useCreateAppointment();
  const isMobile = useIsMobile();

  const isStaff = currentUser?.role === EUserRole.STAFF;
  const isManager = currentUser?.role === EUserRole.MANAGER;
  // manager и выше: выбор мастера из employees; для STAFF — только свой id (поле скрыто)
  const showMasterSelect = !isStaff && masters.length > 0;
  // Роли для запроса привязок: staff → [staff], manager → [staff, manager], owner → все
  const staffMapRoles: TUserRole[] = isStaff
    ? [EUserRole.STAFF]
    : isManager
      ? [EUserRole.STAFF, EUserRole.MANAGER]
      : [EUserRole.STAFF, EUserRole.MANAGER, EUserRole.OWNER];
  // Solo plan / один мастер — автовыбор
  const defaultEmployeeId = showMasterSelect
    ? masters.length === 1
      ? masters[0].id
      : ""
    : undefined;

  const addAppointmentSchema = createAddAppointmentSchema(t);
  const form = useForm<TAddAppointmentFormData>({
    resolver: zodResolver(addAppointmentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      comment: "",
      employee_id: defaultEmployeeId,
      service_id: "",
      startDate: startDate ?? new Date(),
      startTime: startTime ?? { hour: 10, minute: 0 },
    },
  });

  // --- Привязки услуг ↔ мастеров ---
  const watchedEmployeeId = form.watch("employee_id");
  const watchedServiceId = form.watch("service_id");

  // Для staff — один запрос по своему id, для остальных — по выбранному мастеру
  const employeeIdForServices = isStaff
    ? currentUser?.id
    : watchedEmployeeId || undefined;
  const { data: employeeServicesData } = useGetEmployeeServices(
    employeeIdForServices
  );
  const linkedServiceIds = useMemo(
    () => new Set(employeeServicesData?.services.map(s => s.id)),
    [employeeServicesData]
  );

  // Мастера привязанные к услугам — только для manager+ (staff не выбирает мастера)
  const { staffMap } = useServiceStaffMap(
    !isStaff ? locationId : undefined,
    staffMapRoles
  );
  const linkedEmployeeIds = useMemo(() => {
    if (!watchedServiceId) return null;
    const staff = staffMap.get(watchedServiceId);
    return new Set(staff?.map(s => s.employee.id) ?? []);
  }, [watchedServiceId, staffMap]);

  const onSubmit = async (values: TAddAppointmentFormData) => {
    const employeeId = isStaff ? currentUser?.id : values.employee_id;
    if (!employeeId) {
      toast.error(t("errors.selectStaff"));
      return;
    }
    if (!locationId) {
      toast.error(t("errors.selectLocation"));
      return;
    }
    const d = new Date(values.startDate);
    d.setHours(values.startTime.hour, values.startTime.minute, 0, 0);
    const start_at = toTimestampWithTz(d);

    try {
      await createAppointment.mutateAsync({
        phone: values.phone,
        first_name: values.first_name,
        last_name: values.last_name,
        comment: values.comment ?? "",
        employee_id: employeeId,
        location_id: locationId,
        service_id: values.service_id,
        start_at,
      });
      onOpenChange(false);
      form.reset();
    } catch (err) {
      // Расшифровываем backend-ключ (slot_already_occupied, employee_cannot_serve и т.д.)
      // через apiErrors.*; fallback на общий "errorCreating" если ключа нет
      const key = getApiErrorKey(err);
      const msg =
        key !== "unknown" ? tRoot(`apiErrors.${key}`) : t("errorCreating");
      toast.error(msg);
    }
  };

  // Обновляем дату/время при изменении пропсов
  useEffect(() => {
    if (startDate != null) form.setValue("startDate", startDate);
    if (startTime != null) form.setValue("startTime", startTime);
  }, [startDate, startTime, form]);

  // Автовыбор единственного мастера (solo plan)
  useEffect(() => {
    if (
      showMasterSelect &&
      masters.length === 1 &&
      !form.getValues("employee_id")
    ) {
      form.setValue("employee_id", masters[0].id);
    }
  }, [masters, showMasterSelect, form]);

  // Общий контент формы для обоих вариантов
  const formContent = (
    <Form {...form}>
      <form
        id="event-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4 overflow-y-auto"
      >
        {/* Мастер: для manager+ — выбор из employees; для STAFF — скрыто */}
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
                      {masters.map(master => {
                        const isUnlinked =
                          linkedEmployeeIds !== null &&
                          !linkedEmployeeIds.has(master.id);
                        return (
                          <SelectItem
                            key={master.id}
                            value={master.id}
                            disabled={isUnlinked}
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
                              {isUnlinked && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {t("notLinkedMaster")}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Услуга */}
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
                            : t("errors.selectLocationFirst")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesData?.services
                        ?.filter(s => s.active)
                        .map(s => {
                          // Сотрудник определён, но услуга не привязана к нему
                          const isUnlinked =
                            !!employeeIdForServices &&
                            linkedServiceIds.size > 0 &&
                            !linkedServiceIds.has(s.id);
                          return (
                            <SelectItem
                              key={s.id}
                              value={s.id}
                              disabled={isUnlinked}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`size-2.5 shrink-0 rounded-full ${EVENT_COLOR_BG[s.color as TEventColor] ?? "bg-gray-600"}`}
                                />
                                {s.name}
                                {isUnlinked && (
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {t("notLinkedService")}
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Имя/Фамилия/Телефон */}
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

        {/* Дата и время */}
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

        {/* Комментарий */}
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
                  value={field.value ?? ""}
                  data-invalid={fieldState.invalid}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  // Кнопки
  const footerContent = (
    <div className="flex gap-3 p-4 border-t w-full">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => onOpenChange(false)}
      >
        {t("cancel")}
      </Button>
      <Button form="event-form" type="submit" className="flex-1">
        {t("add")}
      </Button>
    </div>
  );

  // Мобилка: Vaul bottom-sheet
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle>{t("title")}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto">{formContent}</div>
          {footerContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Десктоп: Sheet справа
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-3/4 sm:max-w-md p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b">
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">{formContent}</div>
        <SheetFooter className="p-0">{footerContent}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
