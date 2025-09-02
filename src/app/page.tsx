/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

import Calendar from "@/components/Calendar/Calendar";
import { Event } from "@/db/schema";
import {
  Plus,
  Calendar as CalendarIcon,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  useEvents,
  usePopularEvents,
  useUpcomingEvents,
} from "@/hooks/useEvents.ts";
import Filters from "@/components/Filters/Filters";
import EventModal from "@/components/EventModal/EventModal";
import CreateEventModal from "@/components/CreateEventModal/CreateEventModal";

export default function HomePage() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState({});
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch data
  const { data: events } = useEvents(filters);
  const { data: upcomingEvents } = useUpcomingEvents(3);
  const { data: popularEvents } = usePopularEvents(3);

  // Extract unique categories and locations for filters
  const categories = useMemo(() => {
    if (!events) return [];
    const allCategories = events.map((event) => event.category);
    return Array.from(new Set(allCategories));
  }, [events]);

  const locations = useMemo(() => {
    if (!events) return [];
    const allLocations = events.map((event) => event.location);
    return Array.from(new Set(allLocations));
  }, [events]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <CalendarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                EventCalendar
              </h1>
            </div>

            {/* Nav Links */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-gray-900 text-sm sm:text-base font-medium"
                  >
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="text-purple-700 hover:text-purple-900 text-sm sm:text-base font-medium"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Event
                  </button>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-center text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-center text-sm font-medium hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white mb-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
                Discover Amazing Events
              </h2>
              <p className="text-base sm:text-xl mb-4 sm:mb-6 opacity-90">
                Find, book, and manage events all in one place. Join thousands
                of users who trust our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-5 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="#events"
                  className="border-2 border-white text-white px-5 py-3 rounded-lg font-semibold text-center hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Total Events */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg mr-3 sm:mr-4">
                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {events.length}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Total Events
                  </p>
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg mr-3 sm:mr-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {events.length}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Total Attendees
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-orange-100 rounded-lg mr-3 sm:mr-4">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {categories.length}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Categories
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                      {new Date(event.date).toLocaleDateString()} •{" "}
                      {event.location}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {event.category}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {event.maxAttendees} spots
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Calendar Section */}
        <div id="events">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
              Event Calendar
            </h2>
          </div>

          <Filters
            onFilterChange={handleFilterChange}
            categories={categories}
            locations={locations}
          />

          <div className="overflow-x-auto">
            <Calendar onEventClick={handleEventClick} filters={filters} />
          </div>
        </div>
      </main>

      {/* Modals */}
      {isEventModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
        />
      )}

      {isCreateModalOpen && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}
