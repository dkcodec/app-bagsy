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
import { useGetEmployees } from "@/src/shared/hooks/user-staff";
import { EUserRole, type TUserRole } from "@/src/shared/types/user";
import type { GetEmployeesParams } from "@/src/shared/services/employee-service";
import { IServiceDto } from "@/src/shared/services/service-service";
import { useMemo } from "react";
import { useDisclosure } from "@/src/shared/hooks/use-disclosure";
import { useIsMobile } from "@/src/shared";

/**
 * Схема валидации для быстрого добавления сотрудника к услуге
 */
const createAttachMasterSchema = (
  t: (key: string) => string,
  isEmployeeRequired: boolean
) => {
  const baseSchema = z.object({
    price: z
      .number(t("priceRequired"))
      .positive(t("pricePositive"))
      .min(1, t("priceMin")),
    service_id: z.string().min(1, t("serviceIdRequired")),
  });

  if (isEmployeeRequired) {
    return baseSchema.extend({
      employee_id: z.string().min(1, t("masterPhoneRequired")),
    });
  }

  return baseSchema.extend({
    employee_id: z.string().optional(),
  });
};

type AttachMasterFormData = z.infer<
  ReturnType<typeof createAttachMasterSchema>
>;

interface AttachMasterPopoverProps {
  /** Услуга, к которой привязывается мастер */
  service: IServiceDto;
  /** UUID локации для загрузки списка мастеров */
  locationId?: string;
  /** Колбэк для открытия полного диалога */
  onOpenDialog?: () => void;
}

/**
 * Компонент быстрого добавления сотрудника к услуге через Popover
 * POST /api/v1/employee-services
 */
export function AttachMasterPopover({
  service,
  locationId,
  onOpenDialog,
}: AttachMasterPopoverProps) {
  const t = useTranslations("Services.attachMaster");
  const { data: currentUser } = useCurrentUser();
  const createMasterService = useCreateMasterService();
  const { isOpen, onClose, onToggle } = useDisclosure();
  const isMobile = useIsMobile();

  const isStaff = currentUser?.role === EUserRole.STAFF;
  const isSelfOwner = currentUser?.role === EUserRole.OWNER;
  const showMasterSelect = !isStaff;
  const isEmployeeRequired =
    currentUser?.role === EUserRole.MANAGER ||
    currentUser?.role === EUserRole.OWNER;

  // Параметры для загрузки списка мастеров
  const employeesParams = useMemo<GetEmployeesParams | undefined>(() => {
    if (!currentUser || !showMasterSelect || !locationId) return undefined;

    const params: GetEmployeesParams = {
      role: [EUserRole.STAFF, EUserRole.MANAGER] as TUserRole[],
    };

    if (currentUser.role === EUserRole.MANAGER) {
      params.location_id = currentUser.location_id;
    } else if (currentUser.role === EUserRole.OWNER && locationId) {
      params.location_id = locationId;
    }

    return params;
  }, [currentUser, showMasterSelect, locationId]);

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployees(employeesParams);

  const schema = createAttachMasterSchema(t, isEmployeeRequired);

  const form = useForm<AttachMasterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      employee_id: undefined,
      price: service.min_price || 0,
      service_id: service.id,
    },
  });

  const onSubmit = async (data: AttachMasterFormData) => {
    try {
      const canUseSelf = isStaff || isSelfOwner;
      const employeeId =
        canUseSelf && !data.employee_id ? currentUser?.id : data.employee_id;

      if (!employeeId && isEmployeeRequired) {
        toast.error(t("masterPhoneRequired"));
        return;
      }

      if (!employeeId) {
        toast.error(t("masterPhoneRequired"));
        return;
      }

      await createMasterService.mutateAsync({
        service_id: data.service_id,
        price: String(data.price),
        employee_id: employeeId,
      });

      toast.success(t("success"));
      form.reset({
        employee_id: undefined,
        price: service.min_price || 0,
        service_id: service.id,
      });
      onClose();
    } catch (error) {
      console.error("Ошибка привязки мастера:", error);
      toast.error(t("error"));
    }
  };

  const masters = employeesData?.employees || [];

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
            {/* Выбор сотрудника (скрыто для STAFF) */}
            {showMasterSelect && (
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("master")}</FormLabel>
                    <FormControl>
                      {isLoadingEmployees ? (
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
                            {/* Опция "Себя" для Owner */}
                            {isSelfOwner && currentUser && (
                              <SelectItem value={currentUser.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarImage
                                      src={currentUser.avatar_url}
                                      alt={`${currentUser.first_name} ${currentUser.last_name}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {`${currentUser.first_name[0]}${currentUser.last_name[0]}`}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{t("myself")}</span>
                                </div>
                              </SelectItem>
                            )}
                            {masters.map(master => (
                              <SelectItem key={master.id} value={master.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarImage
                                      src={master.avatar_url}
                                      alt={`${master.first_name} ${master.last_name}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {`${master.first_name[0]}${master.last_name[0]}`}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">
                                    {master.first_name} {master.last_name}
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
