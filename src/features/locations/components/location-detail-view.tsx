"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { ArrowLeft, Copy, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { QRCode } from "react-qrcode-logo";

import { Badge, Button, Skeleton } from "@/src/entities";
import type { ILocationDto } from "@/src/shared/services/location-service";
import { useGetEmployees } from "@/src/shared/hooks/user-staff";
import { useLocationServices } from "@/src/shared/hooks/use-services";
import { useLocationScheduleWeek } from "@/src/shared/hooks/use-location-schedule";
import { formatDateOnly } from "@/src/shared/utils/formater";
import { EditLocationDialog } from "./edit-location-dialog";
import { DeleteLocationDialog } from "./delete-location-dialog";
import { ToggleActiveDialog } from "./toggle-active-dialog";
import { useIsMobile } from "@/src/shared";

// Карта загружается только на клиенте (Leaflet требует window)
const AddressMap = dynamic(
  () => import("./address-map").then(mod => ({ default: mod.AddressMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full rounded-lg bg-muted animate-pulse" />
    ),
  }
);

/** Дни недели: index по API (0=вс), отображение пн-вс */
const WEEK_DAYS_UI = [
  { index: 1, key: "monday", short: "mon" },
  { index: 2, key: "tuesday", short: "tue" },
  { index: 3, key: "wednesday", short: "wed" },
  { index: 4, key: "thursday", short: "thu" },
  { index: 5, key: "friday", short: "fri" },
  { index: 6, key: "saturday", short: "sat" },
  { index: 0, key: "sunday", short: "sun" },
];

interface LocationDetailViewProps {
  location: ILocationDto;
  showBack?: boolean;
  onAddLocation?: () => void;
}

/**
 * Детальный вид локации — карточка с картой, расписанием, статистикой, QR
 * Включает кнопки Edit и Delete
 */
export function LocationDetailView({
  location,
  showBack = false,
  onAddLocation,
}: LocationDetailViewProps) {
  const t = useTranslations("Locations");
  const tDays = useTranslations("Dashboard.Settings");
  const locale = useLocale();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();

  const [showQR, setShowQR] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toggleActiveOpen, setToggleActiveOpen] = useState(false);

  // Данные
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployees({
    location_id: location.id,
  });
  const { data: servicesData, isLoading: servicesLoading } =
    useLocationServices(location.id);
  const { scheduleByDay, isLoading: scheduleLoading } = useLocationScheduleWeek(
    location.id
  );

  // Форматирование
  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";
  const fullAddress = useMemo(() => {
    const { street, building, city } = location.address;
    return [street, building, city].filter(Boolean).join(", ");
  }, [location.address]);

  const bookingUrl = `bagsy.kz/appointment/${location.slug}`;
  const bookingFullUrl = `${process.env.NEXT_PUBLIC_DOMAIN}appointment/${location.slug}`;

  // Копирование ссылки
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(bookingFullUrl);
    toast.success(t("detail.linkCopied"));
  };

  // Тип расписания для отображения
  const scheduleTypeLabel =
    location.schedule_type === "fixed"
      ? t("detail.scheduleTypes.fixed")
      : t("detail.scheduleTypes.mixed");

  return (
    <>
      <div className="flex flex-col gap-5 p-4 mx-auto w-full">
        {/* Кнопка назад (только в network mode) */}
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 gap-1 text-muted-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("detail.backToAll")}
          </Button>
        )}

        {/* Заголовок: имя, адрес, статус, Edit/Delete */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-medium truncate">{location.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {fullAddress}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={location.active ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setToggleActiveOpen(true)}
            >
              {location.active ? t("active") : t("inactive")}
            </Badge>
            {onAddLocation &&
              (isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onAddLocation}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={onAddLocation}>
                  <Plus className="h-4 w-4" />
                  {t("network.addLocation")}
                </Button>
              ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Инфо-грид: телефон, тип расписания, длительность слота */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoCard label={t("detail.phone")} value={location.phone} />
          <InfoCard
            label={t("detail.scheduleType")}
            value={scheduleTypeLabel}
          />
          <InfoCard
            label={t("detail.slotDuration")}
            value={`${location.slot_duration_minutes} ${t("detail.minutesShort")}`}
          />
        </div>

        {/* Карта */}
        <AddressMap
          latitude={location.coordinates.latitude}
          longitude={location.coordinates.longitude}
          address={fullAddress}
          className="!h-[200px]"
        />

        {/* Часы работы */}
        <div>
          <h3 className="text-sm font-medium mb-3">
            {t("detail.workingHours")}
          </h3>
          {scheduleLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : Object.keys(scheduleByDay).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("detail.noSchedule")}
            </p>
          ) : (
            <div className="border rounded-lg divide-y">
              {WEEK_DAYS_UI.map(day => {
                const slots = scheduleByDay[day.index];
                return (
                  <div
                    key={day.index}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <span>{tDays(day.short)}</span>
                    {slots && slots.length > 0 ? (
                      <span className="font-medium">
                        {slots
                          .map(s => `${s.start_time} — ${s.end_time}`)
                          .join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t("detail.closed")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Статистика */}
        <div>
          <h3 className="text-sm font-medium mb-3">Quick stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label={t("detail.staffCount")}
              value={employeesData?.total}
              isLoading={employeesLoading}
            />
            <StatCard
              label={t("detail.servicesCount")}
              value={servicesData?.services?.length}
              isLoading={servicesLoading}
            />
          </div>
        </div>

        {/* Ссылка для записи + QR + Share */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-mono text-primary truncate">
                {bookingUrl}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("detail.bookingLinkHint")}
              </p>
            </div>
            <div className="flex gap-2 shrink-0 flex-col md:flex-row">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                {t("detail.copyLink")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
              >
                {t("detail.qrCode")}
              </Button>
              {/* Кнопка «Поделиться» через Web Share API */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: location.name,
                      text: t("detail.bookingLinkHint"),
                      url: bookingFullUrl,
                    });
                  } else {
                    handleCopyLink();
                  }
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {/* QR-код с логотипом, адаптируется под тему */}
          {showQR && (
            <div className="mt-4 flex justify-center">
              <QRCode
                value={bookingFullUrl}
                size={160}
                ecLevel="H"
                logoImage={
                  resolvedTheme === "dark"
                    ? "/logo-dark.svg"
                    : "/logo-light.svg"
                }
                logoWidth={32}
                logoHeight={32}
                logoPadding={4}
                logoPaddingStyle="circle"
                qrStyle="dots"
                eyeRadius={6}
                fgColor={resolvedTheme === "dark" ? "#ffffff" : "#000000"}
                bgColor={resolvedTheme === "dark" ? "#000000" : "#ffffff"}
              />
            </div>
          )}
        </div>

        {/* Технический ID */}
        <p className="text-xs text-muted-foreground pt-2 border-t">
          {t("detail.technicalId")}: {location.id} — {t("detail.createdAt")}{" "}
          {formatDateOnly(location.created_at, dateLocale)}
        </p>
      </div>

      {/* Диалоги */}
      <EditLocationDialog
        location={location}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteLocationDialog
        location={location}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <ToggleActiveDialog
        location={location}
        open={toggleActiveOpen}
        onOpenChange={setToggleActiveOpen}
      />
    </>
  );
}

/** Мини-карточка для инфо-грида */
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

/** Мини-карточка для статистики со скелетоном */
function StatCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value?: number;
  isLoading: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {isLoading ? (
        <Skeleton className="h-7 w-10" />
      ) : (
        <p className="text-xl font-medium">{value ?? 0}</p>
      )}
    </div>
  );
}
