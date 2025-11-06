import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: {
          commit: process.env.GITHUB_SHA || "unknown",
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Healthcheck failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
      }
    );
  }
}
