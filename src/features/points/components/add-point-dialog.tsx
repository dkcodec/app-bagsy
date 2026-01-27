"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/entities/dialog";
import { useTranslations } from "next-intl";
import { AddPointForm } from "./add-point-form";

interface AddPointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Диалог для добавления новой точки обслуживания
 * Содержит форму с валидацией и компонентом редактирования расписания
 */
export function AddPointDialog({ open, onOpenChange }: AddPointDialogProps) {
  const t = useTranslations("Points.addPointDialog");

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <AddPointForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
