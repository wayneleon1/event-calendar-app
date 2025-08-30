/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { X, Calendar, Clock, MapPin, Users, Type, Shield } from "lucide-react";
import { useCreateEvent } from "@/hooks/useEvents.ts";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  endDate: string;
  category: string;
  location: string;
  maxAttendees: number;
}

const categories = [
  "Conference",
  "Workshop",
  "Meeting",
  "Social",
  "Networking",
  "Training",
  "Other",
];
const locations = [
  "New York",
  "London",
  "Tokyo",
  "San Francisco",
  "Berlin",
  "Paris",
  "Remote",
  "Other",
];

export default function CreateEventModal({
  isOpen,
  onClose,
}: CreateEventModalProps) {
  const { user } = useAuth();
  const createEvent = useCreateEvent();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EventFormData>({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      endDate: "",
      category: "Conference",
      location: "Remote",
      maxAttendees: 50,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Make sure field names match what the API expects
      const eventData = {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : undefined, // Use endDate (camelCase)
        category: data.category,
        location: data.location,
        maxAttendees: Number(data.maxAttendees), // Use maxAttendees (camelCase)
        created_by: user.id, // Use created_by (snake_case if required by backend, but camelCase for TS type)
      };

      console.log("Submitting event data:", eventData);
      console.log("User object:", user);

      await createEvent.mutateAsync(eventData);
      handleClose();
    } catch (error: any) {
      console.error("Failed to create event:", error);
      alert(error.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Shield size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600 mb-4">
              Only administrators can create events. Please contact an admin if
              you need to create an event.
            </p>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const startDate = watch("date");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <p className="text-gray-600 mt-1">
            Fill in the details for your event
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Event Title
            </label>
            <div className="relative">
              <Type size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="title"
                {...register("title", { required: "Title is required" })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register("description", {
                required: "Description is required",
              })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your event"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Date & Time
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  id="date"
                  type="datetime-local"
                  {...register("date", { required: "Start date is required" })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.date && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                End Date & Time (Optional)
              </label>
              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  id="endDate"
                  type="datetime-local"
                  {...register("endDate")}
                  min={startDate}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category
              </label>
              <select
                id="category"
                {...register("category", { required: "Category is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <select
                  id="location"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label
              htmlFor="maxAttendees"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Maximum Attendees
            </label>
            <div className="relative">
              <Users
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                id="maxAttendees"
                type="number"
                min="1"
                max="1000"
                {...register("maxAttendees", {
                  required: "Maximum attendees is required",
                  min: { value: 1, message: "Must be at least 1" },
                  max: { value: 1000, message: "Cannot exceed 1000" },
                })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.maxAttendees && (
              <p className="text-red-600 text-sm mt-1">
                {errors.maxAttendees.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || createEvent.isPending}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting || createEvent.isPending
                ? "Creating Event..."
                : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
