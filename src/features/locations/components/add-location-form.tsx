"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/src/entities/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/entities/form";
import { Input } from "@/src/entities/input";
import { Textarea } from "@/src/entities/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import { Skeleton } from "@/src/entities/skeleton";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import {
  useLocationCategories,
  useCreateLocation,
} from "@/src/shared/hooks/use-network-locations";
import { AddressSearch } from "./address-search";
import dynamic from "next/dynamic";
import type { INominatimResult } from "@/src/shared/services/nominatim-service";
import { PhoneInput } from "@/src/widgets";
import { ESubscriptionPlan } from "@/src/shared/types/user";

// Динамический импорт карты с отключением SSR
const AddressMap = dynamic(
  () => import("./address-map").then(mod => ({ default: mod.AddressMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">Загрузка карты...</p>
      </div>
    ),
  }
);

/**
 * Типы расписания:
 * - mixed — у локации своё расписание, у мастеров своё
 * - fixed — все мастера работают по расписанию локации
 * Для SOLO плана всегда fixed (мастер = владелец, расписания синхронизируются на беке)
 */
const SCHEDULE_TYPES = ["mixed", "fixed"] as const;

/** Варианты длительности слота (минуты) — промежутки для записи */
const SLOT_DURATIONS = [5, 10, 15, 30, 60] as const;

/**
 * Схема валидации для создания локации (POST /api/v1/locations)
 */
const createAddLocationSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z
        .string()
        .min(2, t("errors.nameMin"))
        .max(100, t("errors.nameMax")),
      description: z
        .string()
        .max(500, t("errors.descriptionMax"))
        .optional()
        .or(z.literal("")),
      phone: z.string().min(1, t("errors.phoneRequired")),
      category_id: z.string().min(1, t("errors.categoryIdRequired")),
      schedule_type: z.string().min(1, t("errors.scheduleTypeRequired")),
      slot_duration_minutes: z
        .number()
        .int()
        .min(5, t("errors.slotDurationMin"))
        .max(480, t("errors.slotDurationMax")),
      address: z.object({
        city: z
          .string(t("errors.cityMin"))
          .min(2, t("errors.cityMin"))
          .max(100, t("errors.cityMax")),
        street: z
          .string(t("errors.streetMin"))
          .min(2, t("errors.streetMin"))
          .max(200, t("errors.streetMax")),
        building: z.string().optional().or(z.literal("")),
        details: z.string().optional().or(z.literal("")),
      }),
      // Координаты из поиска адреса
      latitude: z.number(),
      longitude: z.number(),
    })
    .refine(data => data.latitude !== 0 || data.longitude !== 0, {
      message: t("errors.addressRequired"),
      path: ["latitude"],
    });

type AddLocationFormData = z.infer<ReturnType<typeof createAddLocationSchema>>;

interface AddPointFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Форма для добавления новой локации обслуживания
 * Поля: название, описание, телефон, категория, тип расписания,
 * длительность слота, адрес (поиск + карта), здание, доп. инфо
 */
export function AddLocationForm({ onSuccess, onCancel }: AddPointFormProps) {
  const t = useTranslations("Locations.addPointForm");
  const { data: currentUser } = useCurrentUser();
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useLocationCategories();
  const createLocationMutation = useCreateLocation();

  // TODO: когда бэк отдаст plan_code в employees/me или organizations/me,
  // заменить на реальную проверку (currentUser.plan_code === "solo")
  // SOLO: владелец = единственный мастер, расписания синхронизируются на беке → всегда fixed
  const isSoloPlan =
    currentUser?.organization.subscription.plan === ESubscriptionPlan.SOLO;

  const schema = createAddLocationSchema(t);

  const form = useForm<AddLocationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      phone: "",
      category_id: "",
      schedule_type: isSoloPlan ? "fixed" : "mixed",
      slot_duration_minutes: 30,
      address: {
        city: "",
        street: "",
        building: "",
        details: "",
      },
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit = async (data: AddLocationFormData) => {
    if (!currentUser?.organization.id) {
      toast.error(t("errors.networkCodeRequired"));
      return;
    }

    try {
      await createLocationMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        phone: data.phone,
        category_id: data.category_id,
        latitude: data.latitude,
        longitude: data.longitude,
        schedule_type: data.schedule_type,
        slot_duration_minutes: data.slot_duration_minutes,
        address: {
          city: data.address.city,
          street: data.address.street,
          building: data.address.building || "",
          details: data.address.details || undefined,
        },
      });

      toast.success(t("success"));
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Ошибка создания локации:", error);
      toast.error(t("errors.submitError"));
    }
  };

  const isPending = createLocationMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Название */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("name")}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Телефон */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <PhoneInput disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Категория */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("categoryId")}</FormLabel>
                <FormControl>
                  {isLoadingCategories ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("categoryIdPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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

          {/* Тип расписания — для SOLO всегда fixed, селект скрыт */}
          <FormField
            control={form.control}
            name="schedule_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("scheduleType")}</FormLabel>
                {isSoloPlan ? (
                  /* SOLO: тип зафиксирован, показываем только инфо */
                  <div className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/50">
                    {t("scheduleTypes.fixed.label")} — {t("soloScheduleNote")}
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("scheduleTypePlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCHEDULE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          <div>
                            <span className="font-medium">
                              {t(`scheduleTypes.${type}.label`)}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {t(`scheduleTypes.${type}.description`)}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {/* Подсказка под полем */}
                {!isSoloPlan && (
                  <p className="text-xs text-muted-foreground">
                    {t(`scheduleTypes.${field.value}.hint`)}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Длительность слота */}
        <FormField
          control={form.control}
          name="slot_duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("slotDuration")}</FormLabel>
              <Select
                onValueChange={value => field.onChange(parseInt(value, 10))}
                value={field.value?.toString()}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={t("slotDurationPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SLOT_DURATIONS.map(minutes => (
                    <SelectItem key={minutes} value={minutes.toString()}>
                      {minutes} {t("minutes")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("slotDurationHint")}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Описание */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("description")}
                  disabled={isPending}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Адрес */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">{t("address.title")}</h4>

          {/* Поиск адреса */}
          <FormField
            control={form.control}
            name="latitude"
            render={() => (
              <FormItem>
                <FormLabel>{t("address.search")}</FormLabel>
                <FormControl>
                  <AddressSearch
                    onSelect={(result: INominatimResult) => {
                      const city =
                        result.address.city ||
                        result.address.town ||
                        result.address.village ||
                        "";
                      const street = result.address.road || "";
                      const building = result.address.house_number || "";

                      form.setValue("address.city", city);
                      form.setValue("address.street", street);
                      form.setValue("address.building", building);
                      form.setValue("latitude", parseFloat(result.lat));
                      form.setValue("longitude", parseFloat(result.lon));
                      form.trigger(["address", "latitude"]);
                    }}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Карта с выбранным адресом */}
          {form.watch("latitude") !== 0 && form.watch("longitude") !== 0 && (
            <AddressMap
              latitude={form.watch("latitude")}
              longitude={form.watch("longitude")}
              address={form.watch("address.street")}
            />
          )}

          {/* Поля адреса */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 text-sm text-muted-foreground">
              {t("address.autocomplete")}
            </div>

            {/* Город */}
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("address.city")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.city")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Улица */}
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("address.street")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.street")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Здание */}
            <FormField
              control={form.control}
              name="address.building"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("address.building")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.buildingPlaceholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Доп. инфо (этаж, офис и т.д.) */}
            <FormField
              control={form.control}
              name="address.details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("address.details")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("address.detailsPlaceholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              {t("cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader className="mr-2 size-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
