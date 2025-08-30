/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookEvent, useCancelBooking } from "@/hooks/useBookings";
import { Event, Booking } from "@/db/schema";
import { format } from "date-fns";
import {
  X,
  Calendar,
  MapPin,
  Users,
  User,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface EventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({
  event,
  isOpen,
  onClose,
}: EventModalProps) {
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);
  const bookEvent = useBookEvent();
  const cancelBooking = useCancelBooking();

  if (!isOpen) return null;

  const isPastEvent = new Date(event.date) < new Date();
  const isFull = event.currentAttendees >= event.maxAttendees;
  const hasUserBooked =
    event.currentAttendees > 0 && user?.id === event.created_by;

  const handleBooking = async () => {
    if (!user) return;

    setIsBooking(true);
    try {
      await bookEvent.mutateAsync(event.id);
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!user) return;

    // In a real app, you'd need to find the booking ID first
    // For now, we'll simulate this
    try {
      // This would be the actual booking ID in a real implementation
      const bookingId = 1;
      await cancelBooking.mutateAsync(bookingId);
    } catch (error) {
      console.error("Cancel booking failed:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-8">
            {event.title}
          </h2>

          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                event.category === "Conference"
                  ? "bg-blue-100 text-blue-800"
                  : event.category === "Workshop"
                  ? "bg-green-100 text-green-800"
                  : event.category === "Meeting"
                  ? "bg-purple-100 text-purple-800"
                  : event.category === "Social"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {event.category}
            </span>
            {isPastEvent && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                Past Event
              </span>
            )}
            {isFull && !isPastEvent && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Fully Booked
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Calendar size={18} className="mr-3 text-gray-400" />
              <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
            </div>

            {event.endDate && (
              <div className="flex items-center text-gray-600">
                <Clock size={18} className="mr-3 text-gray-400" />
                <span>
                  {format(new Date(event.date), "h:mm a")} -{" "}
                  {format(new Date(event.endDate), "h:mm a")}
                </span>
              </div>
            )}

            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-3 text-gray-400" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <Users size={18} className="mr-3 text-gray-400" />
              <span>
                {event.currentAttendees} / {event.maxAttendees} attendees
                {event.currentAttendees > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (
                    {Math.round(
                      (event.currentAttendees / event.maxAttendees) * 100
                    )}
                    % full)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Booking Status */}
          {user && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Your Booking Status
              </h3>
              {hasUserBooked ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle size={18} className="mr-2" />
                  <span>You're attending this event</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <XCircle size={18} className="mr-2" />
                  <span>You're not attending this event</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {user ? (
            !isPastEvent ? (
              hasUserBooked ? (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelBooking.isPending}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelBooking.isPending ? "Cancelling..." : "Cancel Booking"}
                </button>
              ) : !isFull ? (
                <button
                  onClick={handleBooking}
                  disabled={bookEvent.isPending || isBooking}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {bookEvent.isPending || isBooking
                    ? "Booking..."
                    : "Book This Event"}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                >
                  Event Full
                </button>
              )
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
              >
                Event Ended
              </button>
            )
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-3">
                Please sign in to book this event
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
