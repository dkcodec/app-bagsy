"use client";

import { useMemo } from "react";
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
import { PhoneInput, PhoneInputValue } from "@/src/widgets/forms";
import { useInviteEmployee } from "@/src/shared/hooks/user-staff";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { EUserRole } from "@/src/shared/types/user";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useLocations } from "@/src/shared/hooks/use-network-locations";

/**
 * Схема валидации для приглашения сотрудника
 * Принимает список доступных ролей в зависимости от прав текущего пользователя
 */
const createInviteStaffSchema = (
  t: (key: string) => string,
  availableRoles: EUserRole[]
) =>
  z.object({
    first_name: z
      .string()
      .min(2, t("errors.nameMin"))
      .max(50, t("errors.nameMax")),
    last_name: z
      .string()
      .min(2, t("errors.surnameMin"))
      .max(50, t("errors.surnameMax")),
    phone: z
      .string()
      .min(1, t("errors.phoneRequired"))
      .refine(v => /^\+[1-9]\d{1,14}$/.test(v), t("errors.phoneInvalid")),
    role: z.enum(availableRoles as [string, ...string[]], {
      message: t("errors.roleRequired"),
    }),
    // location_id — UUID локации, к которой привязывается сотрудник
    location_id: z.string().min(1, t("errors.pointCodeRequired")),
  });

type InviteStaffFormData = z.infer<ReturnType<typeof createInviteStaffSchema>>;

interface RegisterStaffFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Форма приглашения нового сотрудника
 * Отправляет инвайт через POST /api/v1/employees/invite
 */
export function RegisterStaffForm({
  onSuccess,
  onCancel,
}: RegisterStaffFormProps) {
  const t = useTranslations("Staff.RegisterForm");
  const inviteEmployeeMutation = useInviteEmployee();
  const { data: currentUser } = useCurrentUser();
  const { data: locationsData } = useLocations();

  // Для manager — только его точка, для Owner — список из API
  const pointOptions = useMemo(() => {
    const userLocationId = currentUser?.location_id;
    if (currentUser?.role === EUserRole.MANAGER && userLocationId) {
      return [{ id: userLocationId, name: userLocationId }];
    }
    return (
      locationsData?.locations.map(l => ({
        id: l.id,
        name: l.name || l.id,
      })) ?? []
    );
  }, [currentUser?.role, currentUser?.location_id, locationsData?.locations]);

  // Доступные роли: Manager и Staff
  const availableRoles = useMemo(() => {
    return [EUserRole.MANAGER, EUserRole.STAFF];
  }, []);

  // Создаем схему с переводами и доступными ролями
  const schema = createInviteStaffSchema(t, availableRoles);

  const form = useForm<InviteStaffFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      role: undefined,
      location_id: "",
    },
  });

  const onSubmit = async (data: InviteStaffFormData) => {
    try {
      await inviteEmployeeMutation.mutateAsync({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role as "manager" | "staff",
        location_id: data.location_id,
      });
      toast.success(t("success"));
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Ошибка приглашения сотрудника:", error);
      toast.error(t("errors.submitError"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Имя */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("namePlaceholder")}
                    disabled={inviteEmployeeMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Фамилия */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("surname")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("surnamePlaceholder")}
                    disabled={inviteEmployeeMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Телефон */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value as PhoneInputValue}
                    onChange={field.onChange}
                    defaultCountryCode="KZ"
                    disabled={inviteEmployeeMutation.isPending}
                    placeholder={t("phonePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Роль */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("role")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={inviteEmployeeMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("rolePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={EUserRole.STAFF}>
                      {t("roles.staff")}
                    </SelectItem>
                    <SelectItem value={EUserRole.MANAGER}>
                      {t("roles.manager")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Точка (location) */}
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("locationId")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={inviteEmployeeMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("locationIdPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pointOptions.map(point => (
                    <SelectItem key={point.id} value={point.id}>
                      {point.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={inviteEmployeeMutation.isPending}
            >
              {t("cancel")}
            </Button>
          )}
          <Button type="submit" disabled={inviteEmployeeMutation.isPending}>
            {inviteEmployeeMutation.isPending ? (
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
