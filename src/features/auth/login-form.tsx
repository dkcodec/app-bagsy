"use client";
import { cn } from "@/src/shared/utils/styles";
import { Button } from "@/src/entities/button";
import { Card, CardContent } from "@/src/entities/card";
import { Input } from "@/src/entities/input";
import { Label } from "@/src/entities/label";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { PhoneInput, PhoneInputValue } from "@/src/widgets/forms";
import { useLogin } from "@/src/shared/hooks";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("LoginForm");
  const loginMutation = useLogin();
  const locale = useLocale();
  const [phone, setPhone] = useState<PhoneInputValue>("");
  const router = useRouter();

  const loginSchema = z.object({
    phone: z
      .string()
      .min(1, t("errors.phoneRequired"))
      .refine(v => {
        return /^\+[1-9]\d{1,14}$/.test(v);
      }, t("errors.phoneInvalid")),
    password: z.string().min(6, t("errors.passwordMin")),
  });

  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
    form?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      phone,
      password: String(formData.get("password") || ""),
    };

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        phone: fieldErrors.phone?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    console.log(result);
    setErrors({});

    try {
      await loginMutation.mutateAsync({
        ...result.data,
        phone: phone.toString().replace(/^\+/, "").match(/\d/g)?.join("") || "",
      });
      toast.success(t("loginSuccess"));
      router.replace(`/${locale}`);
    } catch (error) {
      console.error("Ошибка входа:", error);
      toast.error(t("errors.loginError"));
      setErrors({
        form: t("errors.loginError"),
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 dark:bg-white/10 bg-black/10 backdrop-blur-sm">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{t("welcomeBack")}</h1>
                <p className="text-muted-foreground text-balance">
                  {t("loginToYourAccount")}
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phone">{t("phone")}</Label>
                <PhoneInput
                  name="phone"
                  id="phone"
                  required
                  value={phone}
                  onChange={setPhone}
                  classNameInput="border-black"
                  defaultCountryCode="KZ"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone ? (
                  <p id="phone-error" className="text-destructive text-xs">
                    {errors.phone}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Link
                    href={`tel:+${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}
                    className="ml-auto text-sm underline-offset-2 hover:underline hover:text-accent"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
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
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader className="animate-loader" />
                ) : (
                  t("login")
                )}
              </Button>
              {errors.form ? (
                <p className="text-destructive text-center text-sm">
                  {errors.form}
                </p>
              ) : null}
              <div className="text-center text-sm">
                {t("dontHaveAnAccount")}{" "}
                <Link
                  href="/contact"
                  className="underline underline-offset-4 hover:text-accent"
                >
                  {t("contactUs")}
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        {t("byClickingContinue")}{" "}
        <Link
          href={process.env.NEXT_PUBLIC_DOMAIN + `${locale}/terms`}
          className="underline underline-offset-4 hover:text-accent"
        >
          {t("termsOfService")}
        </Link>{" "}
        {t("and")}{" "}
        <Link
          href={process.env.NEXT_PUBLIC_DOMAIN + `${locale}/privacy`}
          className="underline underline-offset-4 hover:text-accent"
        >
          {t("privacyPolicy")}
        </Link>
        .
      </div>
    </div>
  );
}
