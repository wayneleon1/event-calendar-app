import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { adminMiddleware } from "@/middleware/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = adminMiddleware(request);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  try {
    const userId = parseInt(params.id);

    const [updatedUser] = await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
