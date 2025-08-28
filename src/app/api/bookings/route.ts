import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  const authResponse = authMiddleware(request);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  try {
    // Users can only see their own bookings
    // Admins can see all bookings
    let userBookings;

    if (request.user.role === "admin") {
      userBookings = await db
        .select()
        .from(bookings)
        .innerJoin(events, eq(bookings.eventId, events.id))
        .orderBy(events.date);
    } else {
      userBookings = await db
        .select()
        .from(bookings)
        .innerJoin(events, eq(bookings.eventId, events.id))
        .where(eq(bookings.userId, request.user.userId))
        .orderBy(events.date);
    }

    return NextResponse.json(userBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResponse = authMiddleware(request);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  try {
    const body = await request.json();
    const { eventId } = body;
    const userId = request.user.userId;

    // Check if booking already exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.eventId, eventId), eq(bookings.userId, userId)));

    if (existingBooking.length > 0) {
      return NextResponse.json(
        { error: "Already booked for this event" },
        { status: 409 }
      );
    }

    // Check if event has available spots
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    const attendeeCount = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));

    if (attendeeCount.length >= event.maxAttendees) {
      return NextResponse.json(
        { error: "Event is fully booked" },
        { status: 400 }
      );
    }

    // Create booking
    const [newBooking] = await db
      .insert(bookings)
      .values({ eventId, userId })
      .returning();

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
