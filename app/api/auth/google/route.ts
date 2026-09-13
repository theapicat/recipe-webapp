import { NextResponse } from "next/server";

export async function GET() {
  // Fjerner eventuelt /api/auth fra AUTH_API slik at vi rammer /account på Gateway (port 5000)
  const googleLoginUrl = `${process.env.AUTH_API}/account/external-login?provider=Google`;

  return NextResponse.redirect(googleLoginUrl);
}
