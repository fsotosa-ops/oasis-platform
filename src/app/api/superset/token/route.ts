// src/app/api/superset/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SupersetOrchestrator } from "@/backend/superset/superset.orchestrator";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dashboardId = searchParams.get("id"); // Recibimos el ID del frontend

  if (!dashboardId) {
    return NextResponse.json({ error: "Dashboard ID es requerido" }, { status: 400 });
  }

  const result = await SupersetOrchestrator.getGuestToken(dashboardId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ token: result.token });
}