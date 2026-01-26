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
import {
  useServiceCategories,
  useCreateService,
} from "@/src/shared/hooks/use-services";
import { useEffect, useMemo } from "react";
import { TEventColor } from "@/src/shared/types/calendar";

// Массив цветов из типа TEventColor для использования в валидации и UI
const EVENT_COLORS: TEventColor[] = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "gray",
];

/**
 * Схема валидации для создания услуги
 */
const createAddServiceSchema = (t: (key: string) => string) =>
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
    // optional: сбрасывается в undefined при смене категории
    subcategory_id: z
      .number(t("errors.subcategoryIdRequired"))
      .positive(t("errors.subcategoryIdRequired"))
      .int(t("errors.subcategoryIdRequired"))
      .optional(),
    duration_minutes: z
      .number(t("errors.durationRequired"))
      .int(t("errors.durationMustBeInteger"))
      .positive(t("errors.durationMustBePositive"))
      .min(1, t("errors.durationMustBePositive")),
    // Валидация цвета только из типов TEventColor
    color: z.enum(EVENT_COLORS as [TEventColor, ...TEventColor[]]),
  });

type AddServiceFormData = z.infer<ReturnType<typeof createAddServiceSchema>>;

interface AddServiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  pointCode: string | undefined;
}

/**
 * Форма для добавления новой услуги
 * Включает валидацию через zod и компонент выбора категории/подкатегории
 */
export function AddServiceForm({
  onSuccess,
  onCancel,
  pointCode,
}: AddServiceFormProps) {
  const t = useTranslations("Services.addServiceForm");
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useServiceCategories(pointCode);
  const createServiceMutation = useCreateService();

  // Создаем схему валидации
  const schema = createAddServiceSchema(t);

  const form = useForm<AddServiceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category_id: undefined,
      subcategory_id: undefined,
      duration_minutes: 30,
      // Дефолтный цвет из типа TEventColor
      color: EVENT_COLORS[0],
    },
  });

  // Отслеживаем выбранную категорию для фильтрации подкатегорий
  const selectedCategoryId = form.watch("category_id");

  // Получаем подкатегории для выбранной категории
  const availableSubcategories = useMemo(() => {
    if (!selectedCategoryId || !categoriesData) {
      return [];
    }
    const category = categoriesData.categories.find(
      c => c.id === selectedCategoryId
    );
    return category?.subcategories || [];
  }, [selectedCategoryId, categoriesData]);

  // Сбрасываем подкатегорию при изменении категории
  useEffect(() => {
    if (selectedCategoryId) {
      form.setValue("subcategory_id", undefined);
    }
  }, [selectedCategoryId, form]);

  const onSubmit = async (data: AddServiceFormData) => {
    if (!pointCode) {
      toast.error(t("errors.pointCodeRequired"));
      return;
    }
    // API требует number; при сбросе категории subcategory_id может быть undefined
    if (data.subcategory_id == null) {
      form.setError("subcategory_id", {
        message: t("errors.subcategoryIdRequired"),
      });
      return;
    }

    try {
      await createServiceMutation.mutateAsync({
        name: data.name,
        description: data.description || "",
        point_code: pointCode,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        duration_minutes: data.duration_minutes,
        color: data.color,
      });

      toast.success(t("success"));
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Ошибка создания услуги:", error);
      toast.error(t("errors.submitError"));
    }
  };

  // Маппинг цветов для UI (только из типа TEventColor)
  const colorMap: Record<TEventColor, { label: string; bgColor: string }> = {
    blue: { label: t("colors.blue"), bgColor: "bg-blue-600" },
    green: { label: t("colors.green"), bgColor: "bg-green-600" },
    red: { label: t("colors.red"), bgColor: "bg-red-600" },
    yellow: { label: t("colors.yellow"), bgColor: "bg-yellow-600" },
    purple: { label: t("colors.purple"), bgColor: "bg-purple-600" },
    orange: { label: t("colors.orange"), bgColor: "bg-orange-600" },
    gray: { label: t("colors.gray"), bgColor: "bg-gray-600" },
  };

  // Цвета для выбора (только из типа TEventColor)
  const colors = EVENT_COLORS.map(color => ({
    value: color,
    ...colorMap[color],
  }));

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
                    placeholder={t("namePlaceholder")}
                    disabled={createServiceMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Длительность */}
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("durationMinutes")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("durationMinutesPlaceholder")}
                    disabled={createServiceMutation.isPending}
                    {...field}
                    onChange={e => {
                      const value = parseInt(e.target.value, 10);
                      field.onChange(isNaN(value) ? undefined : value);
                    }}
                    value={field.value || ""}
                  />
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
                  placeholder={t("descriptionPlaceholder")}
                  disabled={createServiceMutation.isPending}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Категория и подкатегория */}
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
                      onValueChange={value =>
                        field.onChange(parseInt(value, 10))
                      }
                      value={field.value?.toString()}
                      disabled={createServiceMutation.isPending}
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

          {/* Подкатегория */}
          <FormField
            control={form.control}
            name="subcategory_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("subcategoryId")}</FormLabel>
                <FormControl>
                  {isLoadingCategories ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      onValueChange={value =>
                        field.onChange(parseInt(value, 10))
                      }
                      value={field.value?.toString()}
                      disabled={
                        createServiceMutation.isPending ||
                        !selectedCategoryId ||
                        availableSubcategories.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedCategoryId
                              ? t("subcategoryIdPlaceholderSelectCategory")
                              : availableSubcategories.length === 0
                                ? t("subcategoryIdPlaceholderNoSubcategories")
                                : t("subcategoryIdPlaceholder")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map(subcategory => (
                          <SelectItem
                            key={subcategory.id}
                            value={subcategory.id.toString()}
                          >
                            {subcategory.name}
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

        {/* Цвет */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("color")}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={createServiceMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("colorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-3.5 rounded-full ${color.bgColor}`}
                          />
                          {color.label}
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

        {/* Кнопки действий */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createServiceMutation.isPending}
            >
              {t("cancel")}
            </Button>
          )}
          <Button type="submit" disabled={createServiceMutation.isPending}>
            {createServiceMutation.isPending ? (
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
