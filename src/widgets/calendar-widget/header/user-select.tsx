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

export function UserSelect() {
  const { users, selectedUserId, setSelectedUserId } = useCalendar();
  const t = useTranslations("Dashboard.Calendar.Header");
  return (
    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            <AvatarGroup max={2}>
              {users.map(user => (
                <Avatar key={user.id} className="size-6 text-xxs">
                  <AvatarImage
                    src={user.picturePath ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="text-xxs">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            {t("all")}
          </div>
        </SelectItem>

        {users.map(user => (
          <SelectItem key={user.id} value={user.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar key={user.id} className="size-6">
                <AvatarImage
                  src={user.picturePath ?? undefined}
                  alt={user.name}
                />
                <AvatarFallback className="text-xxs">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              <p className="truncate">{user.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
