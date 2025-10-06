"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import { CalendarProvider } from "@/src/features/calendar";
import { CalendarContainer } from "@/src/widgets";
import { mockEvents, mockUsers } from "@/src/shared";
import { CalendarSettings } from "@/src/features/calendar/settings";
import { useTranslations } from "next-intl";
import { Loader } from "lucide-react";
import { TCalendarView } from "@/src/shared/types/calendar";

interface IProps {
  calendarView: TCalendarView;
  handleViewChange: (view: TCalendarView) => void;
}

const DashboardContent: React.FC<IProps> = ({
  calendarView,
  handleViewChange,
}) => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
      <div className="flex flex-col gap-4">
        <CalendarContainer
          view={calendarView}
          onViewChange={handleViewChange}
        />
      </div>
    </div>
  );
};

export { DashboardContent };
