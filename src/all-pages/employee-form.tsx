"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/src/entities/button";
import { Card, CardContent } from "@/src/entities/card";
import { Input } from "@/src/entities/input";
import { Label } from "@/src/entities/label";
import { PhoneInput, PhoneInputValue } from "@/src/widgets/phone-input";
import { cn } from "@/src/shared/utils/styles";
import { useAuth } from "@/src/shared/hooks/use-auth";

// Типы для пропсов формы работника
export interface EmployeeFormProps {
  className?: string;
  // Список доступных точек (офисов/филиалов) для выбора
  points?: Array<{ id: string; name: string }>; // передается только для net_manager
  // Точка текущего менеджера (если роль = manager)
  managerPointId?: string; // для manager точка выставляется автоматически
  // Сабмит обрабатывается снаружи — чтобы гибко интегрировать с API
  onSubmit?: (payload: {
    firstName: string;
    lastName: string;
    phone: string; // E.164, без плюса можно преобразовать снаружи
    pointId: string;
    role: "manager" | "worker";
    category?: string;
    description?: string;
    workingHours?: string;
    experience?: string;
    photoFile?: File | null;
  }) => Promise<void> | void;
}

// Схема первого шага: все поля обязательны
const step1Schema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  phone: z
    .string()
    .min(1, "Номер обязателен")
    .refine(
      v => /^\+[1-9]\d{1,14}$/.test(v),
      "Телефон должен быть в формате E.164"
    ),
  pointId: z.string().min(1, "Выберите точку"),
  role: z.enum(["manager", "worker"]),
});

// Полная схема (второй блок не обязателен)
const fullSchema = step1Schema.extend({
  category: z.string().optional(),
  description: z.string().optional(),
  workingHours: z.string().optional(),
  experience: z.string().optional(),
  // Файл не валидируем через zod — обрабатываем вручную
});

export default function EmployeeForm({
  className,
  points = [],
  managerPointId,
  onSubmit,
}: EmployeeFormProps) {
  const { user } = useAuth();
  // Определяем роль текущего пользователя
  const currentRole = (user?.role as string | undefined) || "worker";

  // Состояния полей формы
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState<PhoneInputValue>("");
  const [pointId, setPointId] = useState<string>(managerPointId || "");
  const [role, setRole] = useState<"manager" | "worker">(
    currentRole === "net_manager" ? "worker" : "worker"
  );

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [experience, setExperience] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Пошаговая навигация
  const [step, setStep] = useState<1 | 2>(1);

  // Храним ошибки полей для текущего шага/сабмита
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Вычисляем финальный pointId с учетом роли
  const effectivePointId =
    currentRole === "manager" ? managerPointId || pointId : pointId;

  // Валидация и переход на следующий шаг
  const handleNext = () => {
    // Если роль = manager — скрываем выбор роли, фиксируем worker
    const effectiveRole: "manager" | "worker" =
      currentRole === "net_manager" ? role : "worker";
    const result = step1Schema.safeParse({
      firstName,
      lastName,
      phone,
      pointId: currentRole === "manager" ? managerPointId || "" : pointId,
      role: effectiveRole,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        firstName: fieldErrors.firstName?.[0] || "",
        lastName: fieldErrors.lastName?.[0] || "",
        phone: fieldErrors.phone?.[0] || "",
        pointId: fieldErrors.pointId?.[0] || "",
        role: fieldErrors.role?.[0] || "",
      });
      return;
    }
    setErrors({});
    setStep(2);
  };

  // Сабмит всей формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const effectiveRole: "manager" | "worker" =
        currentRole === "net_manager" ? role : "worker";
      const result = fullSchema.safeParse({
        firstName,
        lastName,
        phone,
        pointId: currentRole === "manager" ? managerPointId || "" : pointId,
        role: effectiveRole,
        category: category || undefined,
        description: description || undefined,
        workingHours: workingHours || undefined,
        experience: experience || undefined,
      });
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors(
          Object.fromEntries(
            Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] || ""])
          )
        );
        return;
      }
      setErrors({});
      // Вызываем внешний сабмит — интеграция с API вне компонента
      await onSubmit?.({
        ...result.data,
        phone: phone,
        pointId: result.data.pointId,
        role: result.data.role,
        photoFile,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Рендер простого Select на базе native <select> с shadcn-классами
  const Select = (
    props: React.ComponentProps<"select"> & { label?: string; error?: string }
  ) => {
    const { label, error, className: klass, ...rest } = props;
    return (
      <div className="grid gap-2">
        {label ? <Label>{label}</Label> : null}
        <select
          className={cn(
            "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            klass
          )}
          {...rest}
        />
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Карточка формы с двумя шагами */}
      <Card className="overflow-hidden p-0 dark:bg-white/10 bg-black/10 backdrop-blur-sm">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Навигационные поинты шагов */}
              <div className="flex items-center justify-center gap-3">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    step === 1 ? "bg-primary" : "bg-foreground/30"
                  )}
                />
                <div
                  className={cn(
                    "size-2 rounded-full",
                    step === 2 ? "bg-primary" : "bg-foreground/30"
                  )}
                />
              </div>

              {step === 1 ? (
                <div className="grid gap-4">
                  {/* Имя */}
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      aria-invalid={Boolean(errors.firstName)}
                      aria-describedby={
                        errors.firstName ? "firstName-error" : undefined
                      }
                    />
                    {errors.firstName ? (
                      <p
                        id="firstName-error"
                        className="text-destructive text-xs"
                      >
                        {errors.firstName}
                      </p>
                    ) : null}
                  </div>

                  {/* Фамилия */}
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      aria-invalid={Boolean(errors.lastName)}
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                    />
                    {errors.lastName ? (
                      <p
                        id="lastName-error"
                        className="text-destructive text-xs"
                      >
                        {errors.lastName}
                      </p>
                    ) : null}
                  </div>

                  {/* Телефон */}
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <PhoneInput
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={setPhone}
                      defaultCountryCode="KZ"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={
                        errors.phone ? "phone-error" : undefined
                      }
                    />
                    {errors.phone ? (
                      <p id="phone-error" className="text-destructive text-xs">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>

                  {/* Выбор точки */}
                  {currentRole === "net_manager" ? (
                    <Select
                      label="Точка"
                      value={pointId}
                      onChange={e => setPointId(e.target.value)}
                      error={errors.pointId}
                    >
                      <option value="" disabled>
                        Выберите точку
                      </option>
                      {points.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    // Для manager точка автоматически выставляется
                    <div className="grid gap-1">
                      <Label>Точка</Label>
                      <Input
                        value={managerPointId || ""}
                        readOnly
                        className="opacity-70"
                      />
                      {errors.pointId ? (
                        <p className="text-destructive text-xs">
                          {errors.pointId}
                        </p>
                      ) : null}
                    </div>
                  )}

                  {/* Роль (видна только net_manager) */}
                  {currentRole === "net_manager" ? (
                    <Select
                      label="Роль"
                      value={role}
                      onChange={e =>
                        setRole(e.target.value as "manager" | "worker")
                      }
                      error={errors.role}
                    >
                      <option value="worker">Работник</option>
                      <option value="manager">Менеджер</option>
                    </Select>
                  ) : null}

                  <div className="flex justify-end gap-2">
                    <Button type="button" onClick={handleNext}>
                      Далее
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {/* Сфера/категория */}
                  <div className="grid gap-2">
                    <Label htmlFor="category">Сфера / категория</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    />
                  </div>

                  {/* Описание */}
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Время работы */}
                  <div className="grid gap-2">
                    <Label htmlFor="workingHours">Время работы</Label>
                    <Input
                      id="workingHours"
                      value={workingHours}
                      onChange={e => setWorkingHours(e.target.value)}
                    />
                  </div>

                  {/* Опыт */}
                  <div className="grid gap-2">
                    <Label htmlFor="experience">Опыт</Label>
                    <Input
                      id="experience"
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                    />
                  </div>

                  {/* Фото */}
                  <div className="grid gap-2">
                    <Label htmlFor="photo">Фото</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Назад
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Сохранение..." : "Создать"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
