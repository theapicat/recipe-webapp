import { NextResponse } from "next/server";

export async function GET() {
  const googleLoginUrl = `${process.env.GATEWAY_URL}/auth/account/external-login?provider=Google`;

  return NextResponse.redirect(googleLoginUrl);
}
