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
  usePointCategories,
  useCreatePoint,
} from "@/src/shared/hooks/use-network-points";
import { ScheduleEditor } from "./schedule-editor";
import { AddressSearch } from "./address-search";
import { AddressMap } from "./address-map";
import type { ISchedule } from "@/src/shared/types/user";
import type { INominatimResult } from "@/src/shared/services/nominatim-service";

/**
 * Схема валидации для создания точки
 */
const createAddPointSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("errors.nameMin")).max(100, t("errors.nameMax")),
    description: z
      .string()
      .max(500, t("errors.descriptionMax"))
      .optional()
      .or(z.literal("")),
    category_id: z
      .number(t("errors.categoryIdRequired"))
      .positive(t("errors.categoryIdRequired"))
      .int(t("errors.categoryIdRequired")),
    address: z
      .object({
        city: z
          .string(t("errors.cityMin"))
          .min(2, t("errors.cityMin"))
          .max(100, t("errors.cityMax")),
        street: z
          .string(t("errors.streetMin"))
          .min(2, t("errors.streetMin"))
          .max(200, t("errors.streetMax")),
        coordinates: z.object({
          latitude: z
            .number()
            .min(-90, t("errors.latitudeMin"))
            .max(90, t("errors.latitudeMax")),
          longitude: z
            .number()
            .min(-180, t("errors.longitudeMin"))
            .max(180, t("errors.longitudeMax")),
        }),
      })
      .refine(
        address =>
          address.coordinates.latitude !== 0 ||
          address.coordinates.longitude !== 0,
        {
          message: t("errors.addressRequired"),
          path: ["coordinates"],
        }
      ),
    schedule: z
      .array(
        z.object({
          week_day: z.number().int().min(0).max(6),
          all_day: z.boolean(),
          open: z.string(),
          close: z.string(),
          comment: z.string(),
        })
      )
      .min(1, t("errors.scheduleMin"))
      .refine(
        schedule =>
          schedule.some(item => item.all_day || (item.open && item.close)),
        {
          message: t("errors.scheduleMin"),
        }
      ),
  });

type AddPointFormData = z.infer<ReturnType<typeof createAddPointSchema>>;

interface AddPointFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Форма для добавления новой точки обслуживания
 * Включает валидацию через zod и компонент редактирования расписания
 */
export function AddPointForm({ onSuccess, onCancel }: AddPointFormProps) {
  const t = useTranslations("Points.addPointForm");
  const { data: currentUser } = useCurrentUser();
  const { data: categoriesData, isLoading: isLoadingCategories } =
    usePointCategories();
  const createPointMutation = useCreatePoint();

  // Создаем схему валидации
  const schema = createAddPointSchema(t);

  const form = useForm<AddPointFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category_id: undefined,
      address: {
        city: "",
        street: "",
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      schedule: [],
    },
  });

  const onSubmit = async (data: AddPointFormData) => {
    if (!currentUser?.network_code) {
      toast.error(t("errors.networkCodeRequired"));
      return;
    }

    try {
      // Преобразуем schedule: убираем пустые строки open/close если all_day
      const schedule: ISchedule[] = data.schedule.map(item => ({
        week_day: item.week_day,
        all_day: item.all_day,
        open: item.all_day ? "00:00" : item.open,
        close: item.all_day ? "23:59" : item.close,
        comment: item.comment || "",
      }));

      await createPointMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        network_code: currentUser.network_code,
        category_id: data.category_id,
        address: data.address,
        schedule,
      });

      toast.success(t("success"));
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Ошибка создания точки:", error);
      toast.error(t("errors.submitError"));
    }
  };

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
                    disabled={createPointMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      onValueChange={value =>
                        field.onChange(parseInt(value, 10))
                      }
                      value={field.value?.toString()}
                      disabled={createPointMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("categoryIdPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.categories.map(category => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
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
        </div>

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
                  disabled={createPointMutation.isPending}
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
            name="address.coordinates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("address.search")}</FormLabel>
                <FormControl>
                  <AddressSearch
                    onSelect={(result: INominatimResult) => {
                      // Заполняем поля адреса из результата поиска
                      const city =
                        result.address.city ||
                        result.address.town ||
                        result.address.village ||
                        "";
                      const street = result.address.road || "";

                      form.setValue("address.city", city);
                      form.setValue("address.street", street);
                      form.setValue(
                        "address.coordinates.latitude",
                        parseFloat(result.lat)
                      );
                      form.setValue(
                        "address.coordinates.longitude",
                        parseFloat(result.lon)
                      );
                      // Триггерим валидацию всего адреса
                      form.trigger("address");
                    }}
                    disabled={createPointMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Карта с выбранным адресом */}
          {form.watch("address.coordinates.latitude") !== 0 &&
            form.watch("address.coordinates.longitude") !== 0 && (
              <AddressMap
                latitude={form.watch("address.coordinates.latitude")}
                longitude={form.watch("address.coordinates.longitude")}
                address={form.watch("address.street")}
              />
            )}

          {/* Поля для ручного редактирования */}
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
                      disabled={createPointMutation.isPending}
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
                      disabled={createPointMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Координаты (скрытые, но валидируются) */}
          <div className="hidden">
            <FormField
              control={form.control}
              name="address.coordinates.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.coordinates.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Расписание */}
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ScheduleEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Кнопки действий */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createPointMutation.isPending}
            >
              {t("cancel")}
            </Button>
          )}
          <Button type="submit" disabled={createPointMutation.isPending}>
            {createPointMutation.isPending ? (
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
