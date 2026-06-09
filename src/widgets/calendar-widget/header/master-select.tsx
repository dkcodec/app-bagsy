import { useCalendar } from "@/src/features/calendar";

import { AvatarGroup } from "@/src/entities/avatar-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/entities/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import { useTranslations } from "next-intl";

export function MasterSelect() {
  const { masters, selectedEmployeeId, setSelectedEmployeeId } = useCalendar();
  const t = useTranslations("Dashboard.Calendar.Header");
  return (
    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            <AvatarGroup max={2}>
              {masters.map(master => (
                <Avatar key={master.id} className="size-6 text-xxs">
                  <AvatarImage
                    src={undefined}
                    alt={`${master.first_name} ${master.last_name}`}
                  />
                  <AvatarFallback className="text-xxs">
                    {`${master.first_name[0]}${master.last_name[0]}`}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            {t("all")}
          </div>
        </SelectItem>

        {masters.map(master => (
          <SelectItem key={master.id} value={master.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar key={master.id} className="size-6">
                <AvatarImage
                  src={undefined}
                  alt={`${master.first_name} ${master.last_name}`}
                />
                <AvatarFallback className="text-xxs">
                  {`${master.first_name[0]}${master.last_name[0]}`}
                </AvatarFallback>
              </Avatar>

              <p className="truncate">{`${master.first_name} ${master.last_name}`}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
