import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, bookings } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const popularEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        endDate: events.endDate,
        category: events.category,
        location: events.location,
        maxAttendees: events.maxAttendees,
        createdBy: events.created_by,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        currentAttendees: sql<number>`count(${bookings.id})`,
      })
      .from(events)
      .leftJoin(bookings, sql`${bookings.eventId} = ${events.id}`)
      .groupBy(events.id)
      .orderBy(desc(sql`count(${bookings.id})`))
      .limit(limit);

    return NextResponse.json(popularEvents);
  } catch (error) {
    console.error("Error fetching popular events:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular events" },
      { status: 500 }
    );
  }
}
