"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/src/entities/button";
import { Input } from "@/src/entities/input";
import { Textarea } from "@/src/entities/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/entities/form";
import { useUpdateService } from "@/src/shared/hooks/use-services";
import type { IServiceDto } from "@/src/shared/services/service-service";
import {
  EVENT_COLORS,
  EVENT_COLOR_BG,
  type TEventColor,
} from "@/src/shared/types/calendar";
import { DeleteServiceDialog } from "./delete-service-dialog";

const createSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("nameMin")).max(100, t("nameMax")),
    description: z
      .string()
      .max(500, t("descriptionMax"))
      .optional()
      .or(z.literal("")),
    duration_minutes: z
      .number({ message: t("durationRequired") })
      .int(t("durationMustBeInteger"))
      .positive(t("durationMustBePositive")),
    color: z.enum(EVENT_COLORS as [TEventColor, ...TEventColor[]]),
    sort_order: z.number().int().min(0).optional(),
  });

type FormData = z.infer<ReturnType<typeof createSchema>>;

interface ServiceDetailsTabProps {
  service: IServiceDto;
  /** Закрыть drawer после удаления */
  onClose?: () => void;
}

/**
 * Таб "Детали" в drawer услуги — форма редактирования
 */
export function ServiceDetailsTab({
  service,
  onClose,
}: ServiceDetailsTabProps) {
  const t = useTranslations("Services.drawer");
  const tForm = useTranslations("Services.addServiceForm");
  const tErrors = useTranslations("Services.addServiceForm.errors");
  const updateMutation = useUpdateService();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const schema = createSchema(tErrors);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: service.name,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      color: (EVENT_COLORS.includes(service.color as TEventColor)
        ? service.color
        : "blue") as TEventColor,
      sort_order: service.sort_order ?? 0,
    },
  });

  // Маппинг цветов для UI — bgColor из EVENT_COLOR_BG
  const colorMap = Object.fromEntries(
    EVENT_COLORS.map(c => [
      c,
      { label: tForm(`colors.${c}`), bgColor: EVENT_COLOR_BG[c] },
    ])
  ) as Record<TEventColor, { label: string; bgColor: string }>;

  const onSubmit = async (data: FormData) => {
    try {
      await updateMutation.mutateAsync({
        id: service.id,
        data: {
          name: data.name,
          description: data.description || "",
          duration_minutes: data.duration_minutes,
          color: data.color,
          sort_order: data.sort_order ?? 0,
        },
      });
      toast.success(t("saveSuccess"));
    } catch {
      toast.error(t("saveError"));
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          {/* Название */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("name")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={updateMutation.isPending} />
                </FormControl>
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
                <FormLabel>{tForm("description")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    disabled={updateMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Длительность + Цвет */}
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{tForm("durationMinutes")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={15}
                      disabled={updateMutation.isPending}
                      {...field}
                      onChange={e => {
                        const v = parseInt(e.target.value, 10);
                        field.onChange(isNaN(v) ? 0 : v);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{tForm("color")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_COLORS.map(c => (
                          <SelectItem key={c} value={c}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`size-3 rounded-full ${colorMap[c].bgColor}`}
                              />
                              {colorMap[c].label}
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
          </div>

          {/* Порядок сортировки */}
          <FormField
            control={form.control}
            name="sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sortOrder")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="w-24"
                    disabled={updateMutation.isPending}
                    {...field}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      field.onChange(isNaN(v) ? 0 : v);
                    }}
                    value={field.value ?? 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Кнопки */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-2"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("save")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              {t("deleteBtn")}
            </Button>
          </div>
        </form>
      </Form>

      <DeleteServiceDialog
        service={service}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={onClose}
      />
    </>
  );
}
