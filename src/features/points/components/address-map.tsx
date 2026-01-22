"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useTranslations } from "next-intl";

// Исправление иконок маркера для Leaflet
// По умолчанию иконки не загружаются правильно в Next.js
const icon = L.icon({
  iconUrl: "/map-pin-accent.png",
  iconRetinaUrl: "/map-pin-accent.png",
  iconSize: [30, 30],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

interface AddressMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  className?: string;
}

/**
 * Компонент для отображения карты с маркером выбранного адреса
 * Использует OpenStreetMap через Leaflet
 */
export function AddressMap({
  latitude,
  longitude,
  address,
  className,
}: AddressMapProps) {
  const t = useTranslations("Points.addPointForm.address");

  // Проверяем, что координаты валидны
  const isValid =
    latitude !== 0 &&
    longitude !== 0 &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  // Позиция центра карты
  const center: LatLngExpression = useMemo(
    () => [latitude, longitude],
    [latitude, longitude]
  );

  // Если координаты не валидны, не показываем карту
  if (!isValid) {
    return (
      <div
        className={`flex items-center justify-center h-[300px] border rounded-md bg-muted ${className || ""}`}
      >
        <p className="text-sm text-muted-foreground">{t("mapNoLocation")}</p>
      </div>
    );
  }

  return (
    <div
      className={`h-[300px] w-full rounded-md overflow-hidden border ${className || ""}`}
    >
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        className="h-full w-full"
        key={`${latitude}-${longitude}`} // Пересоздаем карту при изменении координат
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={icon}>
          {address && (
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{t("mapTitle")}</p>
                <p className="text-muted-foreground mt-1">{address}</p>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}
