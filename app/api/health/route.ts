import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "Healthy",
    service: "recipe-webapp",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
}
