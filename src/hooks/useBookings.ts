import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface BookingResponse {
  id: number;
  eventId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const useBookEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<BookingResponse, Error, number>({
    mutationFn: async (eventId) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId: user?.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book event");
      }

      return response.json();
    },
    onMutate: async (eventId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });
      await queryClient.cancelQueries({ queryKey: ["bookings", user?.id] });

      // Snapshot the previous values
      const previousEvents = queryClient.getQueryData(["events"]);
      const previousBookings = queryClient.getQueryData(["bookings", user?.id]);

      // Optimistically update events
      queryClient.setQueryData(["events"], (old: any) =>
        old.map((event: any) =>
          event.id === eventId
            ? { ...event, currentAttendees: event.currentAttendees + 1 }
            : event
        )
      );

      // Optimistically add to bookings
      const newBooking = {
        id: Date.now(), // temporary ID
        eventId,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        event: previousEvents.find((e: any) => e.id === eventId),
      };

      queryClient.setQueryData(["bookings", user?.id], (old: any) => [
        ...(old || []),
        newBooking,
      ]);

      return { previousEvents, previousBookings };
    },
    onError: (err, eventId, context) => {
      // Rollback on error
      queryClient.setQueryData(["events"], context?.previousEvents);
      queryClient.setQueryData(
        ["bookings", user?.id],
        context?.previousBookings
      );
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, number>({
    mutationFn: async (bookingId) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }
    },
    onMutate: async (bookingId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });
      await queryClient.cancelQueries({ queryKey: ["bookings", user?.id] });

      // Snapshot the previous values
      const previousEvents = queryClient.getQueryData(["events"]);
      const previousBookings = queryClient.getQueryData(["bookings", user?.id]);

      // Find the booking to get eventId
      const bookingToRemove = previousBookings.find(
        (b: any) => b.id === bookingId
      );

      // Optimistically update events
      if (bookingToRemove) {
        queryClient.setQueryData(["events"], (old: any) =>
          old.map((event: any) =>
            event.id === bookingToRemove.eventId
              ? { ...event, currentAttendees: event.currentAttendees - 1 }
              : event
          )
        );
      }

      // Optimistically remove from bookings
      queryClient.setQueryData(["bookings", user?.id], (old: any) =>
        old.filter((booking: any) => booking.id !== bookingId)
      );

      return { previousEvents, previousBookings, bookingToRemove };
    },
    onError: (err, bookingId, context) => {
      // Rollback on error
      queryClient.setQueryData(["events"], context?.previousEvents);
      queryClient.setQueryData(
        ["bookings", user?.id],
        context?.previousBookings
      );
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
    },
  });
};
