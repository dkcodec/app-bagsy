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
import { useRegisterStaff } from "@/src/shared/hooks/user-staff";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { EUserRole, TUserRole } from "@/src/shared/types/user";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useNetworkPoints } from "@/src/shared/hooks/use-network-points";

/**
 * Схема валидации для регистрации сотрудника
 * Принимает список доступных ролей в зависимости от прав текущего пользователя
 */
const createRegisterStaffSchema = (
  t: (key: string) => string,
  availableRoles: EUserRole[]
) =>
  z.object({
    name: z.string().min(2, t("errors.nameMin")).max(50, t("errors.nameMax")),
    surname: z
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
    point_code: z
      .string()
      .min(1, t("errors.pointCodeRequired"))
      .max(50, t("errors.pointCodeMax")),
  });

type RegisterStaffFormData = z.infer<
  ReturnType<typeof createRegisterStaffSchema>
>;

interface RegisterStaffFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Форма регистрации нового сотрудника
 * Использует двухэтапный процесс: создает неактивного пользователя
 * и отправляет ссылку для завершения регистрации
 */
export function RegisterStaffForm({
  onSuccess,
  onCancel,
}: RegisterStaffFormProps) {
  const t = useTranslations("Staff.RegisterForm");
  const registerStaffMutation = useRegisterStaff();
  const { data: currentUser } = useCurrentUser();
  const { data: networkPoints } = useNetworkPoints(currentUser?.network_code);

  // Для manager — только его точка, для ролей выше — список из API
  const pointOptions = useMemo(() => {
    if (currentUser?.role === EUserRole.MANAGER && currentUser.point_code) {
      return [{ code: currentUser.point_code, name: currentUser.point_code }];
    }
    return (
      networkPoints?.points.map(p => ({
        code: p.code,
        name: p.name || p.code,
      })) ?? []
    );
  }, [currentUser?.role, currentUser?.point_code, networkPoints?.points]);

  // Определяем доступные роли в зависимости от прав текущего пользователя
  const availableRoles = useMemo(() => {
    const baseRoles = [EUserRole.MANAGER, EUserRole.STAFF];
    // Админ может создавать net_manager
    if (currentUser?.role === EUserRole.ADMIN) {
      return [...baseRoles, EUserRole.NET_MANAGER];
    }
    return baseRoles;
  }, [currentUser?.role]);

  // Создаем схему с переводами и доступными ролями
  const schema = createRegisterStaffSchema(t, availableRoles);

  const form = useForm<RegisterStaffFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      surname: "",
      phone: "",
      role: undefined,
      point_code: "",
    },
  });

  const onSubmit = async (data: RegisterStaffFormData) => {
    try {
      // Явно указываем тип role для совместимости с RegisterStaffRequest
      await registerStaffMutation.mutateAsync({
        ...data,
        role: data.role as Exclude<
          TUserRole,
          EUserRole.ADMIN | EUserRole.SELF_OWNER
        >,
      });
      toast.success(t("success"));
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Ошибка регистрации сотрудника:", error);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("namePlaceholder")}
                    disabled={registerStaffMutation.isPending}
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
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("surname")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("surnamePlaceholder")}
                    disabled={registerStaffMutation.isPending}
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
                    disabled={registerStaffMutation.isPending}
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
                  disabled={registerStaffMutation.isPending}
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
                    {availableRoles.includes(EUserRole.NET_MANAGER) && (
                      <SelectItem value={EUserRole.NET_MANAGER}>
                        {t("roles.net_manager")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Код точки */}
        <FormField
          control={form.control}
          name="point_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("pointCode")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={registerStaffMutation.isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("pointCodePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pointOptions.map(point => (
                    <SelectItem key={point.code} value={point.code}>
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
              disabled={registerStaffMutation.isPending}
            >
              {t("cancel")}
            </Button>
          )}
          <Button type="submit" disabled={registerStaffMutation.isPending}>
            {registerStaffMutation.isPending ? (
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
