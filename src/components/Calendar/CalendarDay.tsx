/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Event } from "@/db/schema";
import { Draggable, DroppableProvided } from "@hello-pangea/dnd";

interface CalendarDayProps {
  day: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  onEventClick: (event: Event) => void;
  provided: DroppableProvided;
  isDraggingOver: boolean;
}

function CalendarDay({
  day,
  events,
  isCurrentMonth,
  onEventClick,
  provided,
  isDraggingOver,
}: CalendarDayProps) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`p-2 min-h-[120px] border border-gray-200 rounded-lg ${
        isCurrentMonth ? "bg-white" : "bg-gray-50"
      } ${isDraggingOver ? "bg-blue-50" : ""}`}
    >
      <div
        className={`text-sm font-medium mb-2 ${
          isCurrentMonth ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {format(day, "d")}
      </div>

      <div className="space-y-1">
        {events.map((event, index) => (
          <Draggable
            key={event.id}
            draggableId={event.id.toString()}
            index={index}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`text-xs p-1 rounded cursor-pointer transition-all ${
                  snapshot.isDragging
                    ? "bg-blue-300 shadow-lg"
                    : "bg-blue-100 hover:bg-blue-200"
                }`}
                onClick={() => onEventClick(event)}
                style={provided.draggableProps.style}
              >
                {event.title}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    </div>
  );
}

export default memo(CalendarDay);
