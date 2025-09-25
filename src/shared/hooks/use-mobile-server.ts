import { headers } from "next/headers";

/**
 * Серверная функция для определения мобильного устройства
 * Работает на основе User-Agent заголовка
 */
export async function getIsMobile(): Promise<boolean> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  // Регулярное выражение для определения мобильных устройств
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;

  return mobileRegex.test(userAgent);
}

/**
 * Серверная функция для получения информации об устройстве
 * Возвращает более детальную информацию
 */
export async function getDeviceInfo() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      userAgent
    );
  const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    userAgent,
  };
}
