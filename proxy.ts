import { NextRequest, NextResponse } from "next/server";
import sessionManager, { OpenIddictTokenResponse } from "@/lib/session/sessionManager";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/user/:path*",
    "/admin/:path*",
  ],
};

const proxy = async (req: NextRequest): Promise<NextResponse<unknown>> => {
  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // 1. Ingen token funnet -> send til innlogging
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const exp = sessionManager.getRemainingExpTime(token);

  // 2. Token utløpt og ingen refresh token -> slett sesjon og omdiriger
  if (exp < 0 && !refreshToken) {
    const loginUrl = new URL("/login?expired=true", req.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    res.cookies.delete("user_data");
    return res;
  }

  const response = NextResponse.next();

  // 3. Forny token dersom det gjenstår mindre enn 5 minutter (300 sekunder)
  if (exp < 300 && refreshToken) {
    try {
      const refreshUrl = `${process.env.NEXT_PUBLIC_AUTH_API || "http://localhost:5000/api/auth"}/connect/token`;

      const bodyParams = new URLSearchParams();
      bodyParams.append("grant_type", "refresh_token");
      bodyParams.append("refresh_token", refreshToken);
      bodyParams.append("client_id", "recipe-web-app");

      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });

      if (refreshRes.ok) {
        const body: OpenIddictTokenResponse = await refreshRes.json();
        const isProd = process.env.NODE_ENV === "production";

        response.cookies.set("token", body.access_token, {
          httpOnly: true,
          secure: isProd,
          maxAge: body.expires_in || 3600,
          sameSite: "lax",
          path: "/",
        });

        if (body.refresh_token) {
          response.cookies.set("refreshToken", body.refresh_token, {
            httpOnly: true,
            secure: isProd,
            maxAge: 60 * 60 * 24 * 14,
            sameSite: "lax",
            path: "/",
          });
        }
      } else {
        const loginUrl = new URL("/login?expired=true", req.url);
        const redirectRes = NextResponse.redirect(loginUrl);
        redirectRes.cookies.delete("token");
        redirectRes.cookies.delete("refreshToken");
        redirectRes.cookies.delete("user_data");
        return redirectRes;
      }
    } catch {
      const loginUrl = new URL("/login?expired=true", req.url);
      const redirectRes = NextResponse.redirect(loginUrl);
      redirectRes.cookies.delete("token");
      redirectRes.cookies.delete("refreshToken");
      redirectRes.cookies.delete("user_data");
      return redirectRes;
    }
  }

  // 4. Sjekk roller for admin-ruter
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const role = sessionManager.getUserRole(token);

    if (role?.toLowerCase() !== "admin") {
      const newUrl = new URL("/404", req.url);
      return NextResponse.redirect(newUrl);
    }
  }

  return response;
};

export default proxy;