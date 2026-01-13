"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Хук для debounce значения
 * Возвращает debounced значение, которое обновляется через указанную задержку
 *
 * @param value - значение для debounce
 * @param delay - задержка в миллисекундах (по умолчанию 500мс)
 * @returns debounced значение
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // Выполнится только через 500мс после остановки ввода
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер для обновления значения
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при изменении value или размонтировании
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Хук для debounce с колбэком
 * Вызывает колбэк через указанную задержку после изменения значения
 *
 * @param value - значение для отслеживания
 * @param callback - функция, которая будет вызвана после задержки
 * @param delay - задержка в миллисекундах (по умолчанию 500мс)
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * useDebounceCallback(searchTerm, (debouncedValue) => {
 *   performSearch(debouncedValue);
 * }, 500);
 */
export function useDebounceCallback<T>(
  value: T,
  callback: (value: T) => void,
  delay: number = 500
): void {
  const prevValueRef = useRef<T>(value);
  const callbackRef = useRef(callback);

  // Обновляем ref колбэка при его изменении
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Вызываем колбэк только если значение изменилось
      if (prevValueRef.current !== value) {
        prevValueRef.current = value;
        callbackRef.current(value);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);
}
