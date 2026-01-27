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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/entities/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/entities/avatar";
import { Plus, Loader } from "lucide-react";
import { toast } from "sonner";
import { useCreateMasterService } from "@/src/shared/hooks/use-master-services";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useGetStaff } from "@/src/shared/hooks/user-staff";
import { EUserRole, type TUserRole } from "@/src/shared/types/user";
import { GetStaffParams } from "@/src/shared/services/staff-service";
import { IServiceDto } from "@/src/shared/services/service-service";
import { useMemo, useState } from "react";
import { useDisclosure } from "@/src/shared/hooks/use-disclosure";
import { useIsMobile } from "@/src/shared";

/**
 * Схема валидации для быстрого добавления мастера к услуге
 */
const createAttachMasterSchema = (
  t: (key: string) => string,
  isMasterPhoneRequired: boolean
) => {
  const baseSchema = z.object({
    price: z
      .number(t("priceRequired"))
      .positive(t("pricePositive"))
      .min(1, t("priceMin")),
    service_id: z.string().min(1, t("serviceIdRequired")),
  });

  if (isMasterPhoneRequired) {
    return baseSchema.extend({
      master_phone: z.string().min(1, t("masterPhoneRequired")),
    });
  }

  return baseSchema.extend({
    master_phone: z.string().optional(),
  });
};

type AttachMasterFormData = z.infer<
  ReturnType<typeof createAttachMasterSchema>
>;

interface AttachMasterPopoverProps {
  /** Услуга, к которой привязывается мастер */
  service: IServiceDto;
  /** Код точки для загрузки списка мастеров */
  pointCode?: string;
  /** Колбэк для открытия полного диалога */
  onOpenDialog?: () => void;
}

/**
 * Компонент быстрого добавления мастера к услуге через Popover
 * Компактная форма для простых случаев
 */
export function AttachMasterPopover({
  service,
  pointCode,
  onOpenDialog,
}: AttachMasterPopoverProps) {
  const t = useTranslations("Services.attachMaster");
  const { data: currentUser } = useCurrentUser();
  const createMasterService = useCreateMasterService();
  const { isOpen, onClose, onToggle } = useDisclosure();
  const isMobile = useIsMobile();

  // Определяем, нужно ли поле выбора мастера
  const isStaff = currentUser?.role === EUserRole.STAFF;
  const isSelfOwner = currentUser?.role === EUserRole.SELF_OWNER;
  const showMasterSelect = !isStaff;
  const isMasterPhoneRequired =
    currentUser?.role === EUserRole.MANAGER ||
    currentUser?.role === EUserRole.NET_MANAGER;

  // Параметры для загрузки списка мастеров
  const staffParams = useMemo<GetStaffParams | undefined>(() => {
    if (!currentUser || !showMasterSelect || !pointCode) {
      return undefined;
    }

    const params: GetStaffParams = {
      role: [EUserRole.STAFF, EUserRole.MANAGER] as TUserRole[],
    };

    if (currentUser.role === EUserRole.MANAGER) {
      params.point_code = currentUser.point_code;
    } else if (
      currentUser.role === EUserRole.NET_MANAGER ||
      currentUser.role === EUserRole.SELF_OWNER
    ) {
      if (pointCode) {
        params.point_code = pointCode;
      } else {
        params.network_code = currentUser.network_code;
      }
    }

    return params;
  }, [currentUser, showMasterSelect, pointCode]);

  // Загружаем список мастеров
  const { data: staffData, isLoading: isLoadingStaff } =
    useGetStaff(staffParams);

  // Создаем схему валидации
  const schema = createAttachMasterSchema(t, isMasterPhoneRequired);

  const form = useForm<AttachMasterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      master_phone: undefined,
      price: service.min_price || 0,
      service_id: service.id,
    },
  });

  const onSubmit = async (data: AttachMasterFormData) => {
    try {
      // Для STAFF и SELF_OWNER master_phone опционален
      const canUseOwnPhone = isStaff || isSelfOwner;
      const masterPhone =
        canUseOwnPhone && !data.master_phone
          ? currentUser?.phone
          : data.master_phone;

      if (!masterPhone && isMasterPhoneRequired) {
        toast.error(t("masterPhoneRequired"));
        return;
      }

      await createMasterService.mutateAsync({
        service_id: data.service_id,
        price: data.price,
        ...(masterPhone && { master_phone: masterPhone }),
      });

      toast.success(t("success"));
      form.reset({
        master_phone: undefined,
        price: service.min_price || 0,
        service_id: service.id,
      });
      onClose(); // Закрываем Popover после успешной привязки
    } catch (error) {
      console.error("Ошибка привязки мастера:", error);
      toast.error(t("error"));
    }
  };

  const masters = staffData?.users || [];

  return (
    <Popover open={isOpen} onOpenChange={onToggle}>
      <PopoverTrigger asChild>
        <Button
          variant={isMobile ? "outline" : "ghost"}
          size="icon"
          className="h-8 w-8 rounded-full"
          aria-label={t("addMaster")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Выбор мастера (скрыто для STAFF) */}
            {showMasterSelect && (
              <FormField
                control={form.control}
                name="master_phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("master")}</FormLabel>
                    <FormControl>
                      {isLoadingStaff ? (
                        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                      ) : (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            data-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue placeholder={t("selectMaster")} />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Опция "Себя" для SELF_OWNER */}
                            {isSelfOwner && currentUser && (
                              <SelectItem value={currentUser.phone}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarImage
                                      src={currentUser.avatar_url}
                                      alt={`${currentUser.name} ${currentUser.surname}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {`${currentUser.name[0]}${currentUser.surname[0]}`}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{t("myself")}</span>
                                </div>
                              </SelectItem>
                            )}
                            {masters.map(master => (
                              <SelectItem
                                key={master.phone}
                                value={master.phone}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarImage
                                      src={master.avatar_url}
                                      alt={`${master.name} ${master.surname}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {`${master.name[0]}${master.surname[0]}`}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">
                                    {master.name} {master.surname}
                                  </span>
                                </div>
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
            )}

            {/* Поле цены */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("price")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("pricePlaceholder")}
                      disabled={createMasterService.isPending}
                      {...field}
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                      value={field.value || ""}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Кнопки действий */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={createMasterService.isPending}
                className="w-full"
                size="sm"
              >
                {createMasterService.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    {t("attaching")}
                  </>
                ) : (
                  t("attach")
                )}
              </Button>

              {/* Кнопка для открытия полного диалога */}
              {onOpenDialog && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenDialog}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("moreDetails")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
