"use client";
import { cn } from "@/src/shared/utils/styles";
import { Button } from "@/src/entities/button";
import { Card, CardContent } from "@/src/entities/card";
import { Input } from "@/src/entities/input";
import { Label } from "@/src/entities/label";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { z } from "zod";
import { decodeJwt } from "../shared/utils/jwt";
import { formatPhone } from "../shared/utils/formater";
import { useAcceptInvite } from "../shared/hooks/use-invites";

export default function InviteForm({
  className,
  token,
  ...props
}: React.ComponentProps<"div"> & { token: string }) {
  const t = useTranslations("InviteForm");
  const payload = decodeJwt<{ phone: string; iat: number; exp: number }>(token);
  const { phone, iat, exp } = payload;
  const acceptInviteMutation = useAcceptInvite();

  // Локальное состояние ошибок формы
  const [errors, setErrors] = useState<{
    password?: string;
    confirm?: string;
    form?: string;
  }>({});

  const schema = z
    .object({
      password: z.string().min(6, t("errors.passwordMin")),
      confirm: z.string().min(6, t("errors.passwordMin")),
    })
    .refine(data => data.password === data.confirm, {
      message: t("errors.passwordsMustMatch"),
      path: ["confirm"],
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      password: String(formData.get("password") || ""),
      confirm: String(formData.get("confirm") || ""),
    };
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        password: fieldErrors.password?.[0],
        confirm: fieldErrors.confirm?.[0],
      });
      return;
    }
    setErrors({});
    // TODO: вызвать server action / api c token + паролем
    // Пример: await finalizeInvite({ token, password: data.password })
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 dark:bg-white/10 bg-black/10 backdrop-blur-sm">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground text-balance">
                  {t("description", { phone: formatPhone(phone) })}
                </p>
              </div>

              <input type="hidden" name="token" value={token} />

              <div className="grid gap-3">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  name="password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className="border-background"
                />
                {errors.password ? (
                  <p id="password-error" className="text-destructive text-xs">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirm">{t("confirmPassword")}</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  name="confirm"
                  aria-invalid={Boolean(errors.confirm)}
                  aria-describedby={
                    errors.confirm ? "confirm-error" : undefined
                  }
                  className="border-background"
                />
                {errors.confirm ? (
                  <p id="confirm-error" className="text-destructive text-xs">
                    {errors.confirm}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full">
                {t("setPassword")}
              </Button>
              {errors.form ? (
                <p className="text-destructive text-center text-sm">
                  {errors.form}
                </p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
