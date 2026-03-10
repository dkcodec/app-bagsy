import { TableCell, TableRow, Badge } from "@/src/entities";
import type { IEmployeeDto } from "@/src/shared/types/user";
import { formatDate } from "@/src/shared/utils/formater";
import { useTranslations, useLocale } from "next-intl";
import { getRoleKey } from "../utils/format-role";

/**
 * Компонент строки таблицы сотрудников
 */
interface StaffTableRowProps {
  user: IEmployeeDto;
}

export function StaffTableRow({ user }: StaffTableRowProps) {
  const t = useTranslations("Staff");
  const locale = useLocale();

  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";

  return (
    <TableRow>
      <TableCell className="font-medium">{user.first_name}</TableCell>
      <TableCell>{user.last_name}</TableCell>
      <TableCell>{user.phone}</TableCell>
      <TableCell>
        <Badge variant="secondary">{t(`roles.${getRoleKey(user.role)}`)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.active ? "default" : "outline"}>
          {user.active ? t("active") : t("inactive")}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(user.created_at, dateLocale)}
      </TableCell>
    </TableRow>
  );
}
