"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/entities/dialog";
import { Button } from "@/src/entities/button";
import { Input } from "@/src/entities/input";
import { Textarea } from "@/src/entities/textarea";
import { Skeleton } from "@/src/entities/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/entities/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import { PhoneInput } from "@/src/widgets";
import type { ILocationDto } from "@/src/shared/services/location-service";
import type { INominatimResult } from "@/src/shared/services/nominatim-service";
import { useUpdateLocation } from "@/src/shared/hooks/use-network-locations";
import { AddressSearch } from "./address-search";

// Карта — только клиент
const AddressMap = dynamic(
  () => import("./address-map").then(mod => ({ default: mod.AddressMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
);

const SLOT_DURATIONS = [5, 10, 15, 30, 60] as const;

/** Схема валидации — те же правила что и при создании */
const createEditSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("errors.nameMin")).max(100, t("errors.nameMax")),
    description: z
      .string()
      .max(500, t("errors.descriptionMax"))
      .optional()
      .or(z.literal("")),
    phone: z.string().min(1, t("errors.phoneRequired")),
    slot_duration_minutes: z
      .number()
      .int()
      .min(5, t("errors.slotDurationMin"))
      .max(480, t("errors.slotDurationMax")),
    address: z.object({
      city: z
        .string()
        .min(2, t("errors.cityMin"))
        .max(100, t("errors.cityMax")),
      street: z
        .string()
        .min(2, t("errors.streetMin"))
        .max(200, t("errors.streetMax")),
      building: z.string().optional().or(z.literal("")),
      details: z.string().optional().or(z.literal("")),
    }),
    latitude: z.number(),
    longitude: z.number(),
  });

type EditFormData = z.infer<ReturnType<typeof createEditSchema>>;

interface EditLocationDialogProps {
  location: ILocationDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Диалог редактирования локации (PUT /api/v1/locations/{id})
 * Предзаполнен текущими данными, позволяет изменить: имя, описание, телефон,
 * длительность слота, адрес
 */
export function EditLocationDialog({
  location,
  open,
  onOpenChange,
}: EditLocationDialogProps) {
  const tForm = useTranslations("Locations.addPointForm");
  const tEdit = useTranslations("Locations.editDialog");
  const updateMutation = useUpdateLocation();

  const schema = createEditSchema(tForm);

  const form = useForm<EditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: location.name,
      description: location.description || "",
      phone: location.phone,
      slot_duration_minutes: location.slot_duration_minutes,
      address: {
        city: location.address.city,
        street: location.address.street,
        building: location.address.building || "",
        details: location.address.details || "",
      },
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
    },
  });

  const onSubmit = async (data: EditFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: location.id,
        data: {
          name: data.name,
          description: data.description || undefined,
          phone: data.phone,
          slot_duration_minutes: data.slot_duration_minutes,
          latitude: data.latitude,
          longitude: data.longitude,
          address: {
            city: data.address.city,
            street: data.address.street,
            building: data.address.building || "",
            details: data.address.details || undefined,
          },
        },
      });
      toast.success(tEdit("success"));
      onOpenChange(false);
    } catch {
      toast.error(tEdit("error"));
    }
  };

  const isPending = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tEdit("title")}</DialogTitle>
          <DialogDescription>{tEdit("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Название + Телефон */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("name")}</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("phone")}</FormLabel>
                    <FormControl>
                      <PhoneInput disabled={isPending} {...field} />
                    </FormControl>
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
                  <FormLabel>{tForm("slotDuration")}</FormLabel>
                  <Select
                    onValueChange={v => field.onChange(parseInt(v, 10))}
                    value={field.value?.toString()}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SLOT_DURATIONS.map(m => (
                        <SelectItem key={m} value={m.toString()}>
                          {m} {tForm("minutes")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Textarea disabled={isPending} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Адрес */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">
                {tForm("address.title")}
              </h4>

              {/* Поиск адреса */}
              <FormField
                control={form.control}
                name="latitude"
                render={() => (
                  <FormItem>
                    <FormLabel>{tForm("address.search")}</FormLabel>
                    <FormControl>
                      <AddressSearch
                        onSelect={(result: INominatimResult) => {
                          const city =
                            result.address.city ||
                            result.address.town ||
                            result.address.village ||
                            "";
                          form.setValue("address.city", city);
                          form.setValue(
                            "address.street",
                            result.address.road || ""
                          );
                          form.setValue(
                            "address.building",
                            result.address.house_number || ""
                          );
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

              {/* Карта */}
              {form.watch("latitude") !== 0 &&
                form.watch("longitude") !== 0 && (
                  <AddressMap
                    latitude={form.watch("latitude")}
                    longitude={form.watch("longitude")}
                    address={form.watch("address.street")}
                  />
                )}

              {/* Поля адреса */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("address.city")}</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("address.street")}</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("address.building")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("address.buildingPlaceholder")}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("address.details")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("address.detailsPlaceholder")}
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

            {/* Кнопки */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {tForm("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    {tEdit("saving")}
                  </>
                ) : (
                  tEdit("save")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
