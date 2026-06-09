"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/src/entities";
import type { IEmployeeDto } from "@/src/shared/types/user";
import { useGetEmployeeServices } from "@/src/shared/hooks/user-staff";

interface ServicesTabProps {
  employee: IEmployeeDto;
}

/**
 * Таб «Услуги» — список услуг сотрудника с ценами
 */
export function ServicesTab({ employee }: ServicesTabProps) {
  const td = useTranslations("Staff.drawer");
  const { data, isLoading } = useGetEmployeeServices(employee.id);

  const services = data?.services || [];

  // Статистика по ценам
  const prices = services.map(s => s.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  return (
    <div className="px-5 py-4">
      {/* Скелетон загрузки */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {td("noServices")}
        </p>
      ) : (
        <>
          {/* Список услуг */}
          <div className="space-y-0">
            {services.map(service => (
              <div
                key={service.id}
                className="flex justify-between items-center py-2.5 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: service.color }}
                  />
                  <div>
                    <p className="text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.duration_minutes} {td("min")}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {service.price.toLocaleString()} ₸
                </span>
              </div>
            ))}
          </div>

          {/* Footer — статистика */}
          <div className="mt-3 pt-3 border-t space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{td("totalServices")}</span>
              <span>{services.length}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{td("priceRange")}</span>
              <span>
                {minPrice.toLocaleString()} — {maxPrice.toLocaleString()} ₸
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
