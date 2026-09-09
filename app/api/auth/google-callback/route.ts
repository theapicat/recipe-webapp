import { NextRequest, NextResponse } from "next/server";
import sessionManager, { OpenIddictTokenResponse } from "@/lib/session/sessionManager";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const userId = searchParams.get("user_id");
  const email = searchParams.get("email");
  const role = searchParams.get("role");

  if (!accessToken || !refreshToken || !userId) {
    return NextResponse.redirect(
      new URL("/login?error=Ugyldig+sesjonsdata+fra+Google", request.url)
    );
  }

  const tokens: OpenIddictTokenResponse = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: 3600,
  };

  const welcomeCompleted = searchParams.get("welcome_completed") === "true";

  const userProfile: UserProfileResponse = {
    userId: userId,
    userName: email || "",
    email: email || "",
    firstName: searchParams.get("first_name") || "",
    lastName: searchParams.get("last_name") || "",
    role: role || "user",
    hasPassword: searchParams.get("has_password") === "true",
    isGoogleAccount: true,
    isEmailConfirmed: true,
    welcomeCompleted: welcomeCompleted,
    isLocked: false,
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  // 1. Sett kakene via sessionManager
  await sessionManager.setSession(tokens, userProfile);

  const targetPath = welcomeCompleted ? "/dashboard" : "/user/welcome";
  const redirectUrl = new URL(targetPath, request.url);

  // 2. Opprett responsen
  const response = NextResponse.redirect(redirectUrl);

  // 3. Tving kakene inn på respons-objektet slik at de garantert sendes til nettleseren
  const isProd = process.env.NODE_ENV === "production";

  response.cookies.set("token", accessToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: 3600,
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: 60 * 60 * 24 * 14,
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set("user_data", JSON.stringify(userProfile), {
    httpOnly: false,
    secure: isProd,
    maxAge: 60 * 60 * 24 * 14,
    sameSite: "lax",
    path: "/",
  });

  return response;
}