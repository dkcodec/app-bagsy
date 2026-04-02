import { Button } from "@/src/entities";
import { useIsMobile } from "@/src/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Информация о пагинации
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  limit: number;
  offset: number;
}

import type { ISubscriptionLimit } from "@/src/shared/types/user";

/**
 * Компонент пагинации для таблицы сотрудников
 */
interface PaginationProps {
  paginationInfo: PaginationInfo;
  onPageChange: (newOffset: number) => void;
  employeeLimits?: ISubscriptionLimit;
}

export function Pagination({
  paginationInfo,
  onPageChange,
  employeeLimits,
}: PaginationProps) {
  const t = useTranslations("Staff.pagination");
  const tStaff = useTranslations("Staff");
  const isMobile = useIsMobile();

  const { offset, limit, total, currentPage, totalPages, hasNext, hasPrev } =
    paginationInfo;

  return (
    <div className="flex flex-col gap-1 mt-4 pt-4 border-t px-3 md:px-4">
      {/* Пагинация: инфо + кнопки */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t("showing")} {offset + 1} - {Math.min(offset + limit, total)}{" "}
          {t("of")} {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(offset - limit)}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            {!isMobile && t("back")}
          </Button>
          <div className="text-sm">
            {!isMobile && t("page")} {currentPage} {t("of")} {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(offset + limit)}
            disabled={!hasNext}
          >
            {!isMobile && t("forward")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Лимит сотрудников */}
      {employeeLimits && (
        <div className="text-xs text-muted-foreground">
          {employeeLimits.used} / {employeeLimits.max ?? "∞"}{" "}
          {tStaff("staffLimit")}
        </div>
      )}
    </div>
  );
}
