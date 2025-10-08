"use client";

import React from "react";
import { CalendarContainer } from "@/src/widgets";
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
