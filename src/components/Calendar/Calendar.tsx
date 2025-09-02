/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isSameYear,
  isPast,
} from "date-fns";
import { Event } from "@/db/schema";
import CalendarDay from "./CalendarDay";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { useEvents, useUpdateEvent } from "@/hooks/useEvents.ts";

interface CalendarProps {
  onEventClick: (event: Event) => void;
  filters?: any;
}

export default function Calendar({ onEventClick, filters }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: events, isLoading } = useEvents(filters);
  const updateEventMutation = useUpdateEvent();
  const { user } = useAuth();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || !events || !user) return;

      const eventId = parseInt(result.draggableId);
      const newDate = new Date(result.destination.droppableId);

      const eventToUpdate = events.find((e) => e.id === eventId);
      if (!eventToUpdate) return;

      // Only allow drag and drop for admin users or event creators
      if (user.role !== "admin" && user.id !== eventToUpdate.created_by) {
        return;
      }

      // Update the event via API
      try {
        await updateEventMutation.mutateAsync({
          ...eventToUpdate,
          date: newDate,
        });
      } catch (error) {
        console.error("Failed to update event:", error);
      }
    },
    [events, user, updateEventMutation]
  );

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let result = events;

    // Apply category filter
    if (filters?.category?.length > 0) {
      result = result.filter((event) =>
        filters.category.includes(event.category)
      );
    }

    // Apply location filter
    if (filters?.location?.length > 0) {
      result = result.filter((event) =>
        filters.location.includes(event.location)
      );
    }

    // Apply date range filter
    if (filters?.dateRange?.start) {
      result = result.filter(
        (event) => new Date(event.date) >= filters.dateRange.start
      );
    }

    if (filters?.dateRange?.end) {
      result = result.filter(
        (event) => new Date(event.date) <= filters.dateRange.end
      );
    }

    // Apply search filter
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [events, filters]);

  const navigateToPreviousMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const navigateToNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={navigateToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={navigateToToday}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>

            <button
              onClick={navigateToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-500 py-2 text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map((day) => {
              const dayEvents = filteredEvents.filter((event) =>
                isSameDay(new Date(event.date), day)
              );

              return (
                <Droppable
                  key={day.toISOString()}
                  droppableId={day.toISOString()}
                >
                  {(provided, snapshot) => (
                    <CalendarDay
                      day={day}
                      events={dayEvents}
                      isCurrentMonth={isSameMonth(day, currentDate)}
                      isToday={isToday(day)}
                      isPast={
                        isPast(day) &&
                        !isToday(day) &&
                        !isSameDay(day, currentDate)
                      }
                      onEventClick={onEventClick}
                      provided={provided}
                      isDraggingOver={snapshot.isDraggingOver}
                    />
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Calendar Legend */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
            <span className="text-gray-600">Regular Event</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
            <span className="text-gray-600">Today&apos;s Event</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
            <span className="text-gray-600">Past Event</span>
          </div>
        </div>
      </div>
    </div>
  );
}
