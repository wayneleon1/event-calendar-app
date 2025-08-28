import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend NextRequest to include user property
declare module "next/server" {
  interface NextRequest {
    user?: any;
  }
}

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const decoded = verify(token, JWT_SECRET) as any;
    request.user = decoded;
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export function adminMiddleware(request: NextRequest) {
  const response = authMiddleware(request);

  if (response.status !== 200) {
    return response;
  }

  if (request.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}
