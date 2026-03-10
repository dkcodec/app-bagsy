"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/src/entities/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/entities/popover";
import { Skeleton } from "@/src/entities/skeleton";
import { useAddressSearch } from "@/src/shared/hooks/use-address-search";
import { useTranslations } from "next-intl";
import type { INominatimResult } from "@/src/shared/services/nominatim-service";
import { cn } from "@/src/shared/utils/styles";

interface AddressSearchProps {
  value?: string;
  onSelect: (result: INominatimResult) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Компонент поиска адресов через Nominatim
 * Отображает autocomplete с результатами поиска
 */
export function AddressSearch({
  value = "",
  onSelect,
  disabled = false,
  className,
}: AddressSearchProps) {
  const t = useTranslations("Locations.addPointForm.address");
  const [searchQuery, setSearchQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Поиск адресов
  const {
    data: results,
    isLoading,
    error,
  } = useAddressSearch(searchQuery, isOpen && searchQuery.length >= 3);

  // Обновляем локальное значение при изменении внешнего
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  // Закрываем popover при выборе адреса
  const handleSelect = (result: INominatimResult) => {
    onSelect(result);
    setSearchQuery(result.display_name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Обработка изменения текста поиска
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    // Открываем popover если есть текст для поиска
    if (newValue.length >= 3) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Обработка фокуса
  const handleFocus = () => {
    if (searchQuery.length >= 3 && results && results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            disabled={disabled}
            className="pl-10"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <div className="max-h-[300px] overflow-y-auto">
          {/* Состояние загрузки */}
          {isLoading && (
            <div className="p-2 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {/* Ошибка */}
          {error && !isLoading && (
            <div className="p-4 text-sm text-destructive text-center">
              {t("searchError")}
            </div>
          )}

          {/* Результаты поиска */}
          {!isLoading && !error && results && results.length > 0 && (
            <div className="p-1">
              {results.map(result => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="w-full text-left p-3 rounded-md hover:bg-accent hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.display_name}
                      </p>
                      {result.address.road && (
                        <p className="text-xs truncate">
                          {result.address.road}
                          {result.address.house_number &&
                            `, ${result.address.house_number}`}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Нет результатов */}
          {!isLoading &&
            !error &&
            searchQuery.length >= 3 &&
            results &&
            results.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {t("noResults")}
              </div>
            )}

          {/* Подсказка */}
          {!isLoading &&
            !error &&
            searchQuery.length > 0 &&
            searchQuery.length < 3 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {t("searchHint")}
              </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
