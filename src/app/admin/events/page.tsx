// src/app/admin/events/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface EventWithCreator {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  category: string;
  location: string;
  maxAttendees: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  currentAttendees: number;
  creator: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminEventsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<EventWithCreator | null>(
    null
  );

  // Fetch all events with creator info
  const { data: events, isLoading } = useQuery<EventWithCreator[]>({
    queryKey: ["admin", "events"],
    queryFn: async () => {
      const response = await fetch("/api/admin/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: user?.role === "admin",
  });

  // Delete event mutation
  const deleteEvent = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      setSelectedEvent(null);
    },
  });

  if (isLoading) {
    return (
      // <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      // </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Event Management
          </h1>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Events</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Location</th>
                    <th className="px-4 py-2 text-left">Creator</th>
                    <th className="px-4 py-2 text-left">Attendees</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events?.map((event) => (
                    <tr key={event.id} className="border-b border-gray-200">
                      <td className="px-4 py-2">{event.id}</td>
                      <td className="px-4 py-2">{event.title}</td>
                      <td className="px-4 py-2">
                        {format(new Date(event.date), "PPp")}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-4 py-2">{event.location}</td>
                      <td className="px-4 py-2">
                        {event.creator.name} ({event.creator.email})
                      </td>
                      <td className="px-4 py-2">
                        {event.currentAttendees}/{event.maxAttendees}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => deleteEvent.mutate(event.id)}
                          disabled={deleteEvent.isPending}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {events?.length === 0 && (
              <p className="text-gray-500 text-center py-8">No events found.</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
