"use client";

import { useQuery } from "@tanstack/react-query";
import { NominatimService } from "../services/nominatim-service";
import { useDebounce } from "./use-debounce";

/**
 * Хук для поиска адресов через Nominatim API
 * Использует debounce для оптимизации запросов
 * @param query - поисковый запрос
 * @param enabled - включен ли поиск (по умолчанию true)
 * @returns Результаты поиска и состояние загрузки
 */
export function useAddressSearch(query: string, enabled: boolean = true) {
  // Debounce запроса на 400мс для уменьшения количества запросов
  const debouncedQuery = useDebounce(query, 400);

  // Поиск выполняется только если запрос >= 3 символов
  const shouldSearch =
    enabled && debouncedQuery && debouncedQuery.trim().length >= 3;

  return useQuery({
    queryKey: ["addressSearch", debouncedQuery],
    queryFn: () => NominatimService.searchAddress(debouncedQuery, 5),
    enabled: !!shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 минут - адреса не меняются часто
    gcTime: 10 * 60 * 1000, // 10 минут в кэше
  });
}
