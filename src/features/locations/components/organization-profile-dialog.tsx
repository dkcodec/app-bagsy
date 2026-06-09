"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/entities/dialog";
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
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useUpdateOrganization } from "@/src/shared/hooks/use-organization";

interface OrganizationProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Вызывается после успешного сохранения или при отмене */
  onComplete: () => void;
}

const createSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("errors.nameMin")).max(100, t("errors.nameMax")),
    description: z
      .string()
      .max(500, t("errors.descriptionMax"))
      .optional()
      .or(z.literal("")),
  });

type FormData = z.infer<ReturnType<typeof createSchema>>;

/**
 * Модалка создания сети — появляется при добавлении второй локации,
 * когда organization.name ещё не заполнено (prompt_org_profile: true)
 */
export function OrganizationProfileDialog({
  open,
  onOpenChange,
  onComplete,
}: OrganizationProfileDialogProps) {
  const t = useTranslations("Locations.organizationProfile");
  const updateOrgMutation = useUpdateOrganization();

  const schema = createSchema(t);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateOrgMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
      });
      toast.success(t("success"));
      form.reset();
      onOpenChange(false);
      onComplete();
    } catch (error) {
      console.error("Ошибка обновления организации:", error);
      toast.error(t("errors.submitError"));
    }
  };

  const isPending = updateOrgMutation.isPending;

  /** Пропустить — закрываем модалку, локация уже создана */
  const handleSkip = () => {
    form.reset();
    onOpenChange(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Название сети */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("namePlaceholder")}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Описание сети */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("orgDescription")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("orgDescriptionPlaceholder")}
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Кнопки */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isPending}
              >
                {t("skip")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
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
      </DialogContent>
    </Dialog>
  );
}
