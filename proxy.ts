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

  // 1. Ingen tokens i det hele tatt -> send til innlogging
  if (!token && !refreshToken) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  let activeToken = token;
  const exp = token ? sessionManager.getRemainingExpTime(token) : -1;
  let refreshedTokens: OpenIddictTokenResponse | null = null;

  // 2. Forny dersom token mangler, er utløpt (exp < 0) eller nærmer seg utløp (exp < 300)
  if ((!token || exp < 300) && refreshToken) {
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
        refreshedTokens = await refreshRes.json();
        activeToken = refreshedTokens!.access_token;
      } else {
        // Refresh token er utgått (f.eks. invalid_grant etter et døgn) -> Tving logout
        return handleLogout(req);
      }
    } catch {
      return handleLogout(req);
    }
  } else if (!token) {
    // Token mangler og vi hadde ikke refreshToken
    return handleLogout(req);
  }

  // 3. Forbered responsen og muter innkommende request-headers slik at Next.js Server Components får det nye tokenet Umiddelbart!
  const requestHeaders = new Headers(req.headers);
  if (refreshedTokens) {
    requestHeaders.set("cookie", `token=${refreshedTokens.access_token}; refreshToken=${refreshedTokens.refresh_token || refreshToken}`);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 4. Sett Set-Cookie på responsen til nettleseren
  if (refreshedTokens) {
    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("token", refreshedTokens.access_token, {
      httpOnly: true,
      secure: isProd,
      maxAge: refreshedTokens.expires_in || 3600,
      sameSite: "lax",
      path: "/",
    });

    if (refreshedTokens.refresh_token) {
      response.cookies.set("refreshToken", refreshedTokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 14,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  // 5. Sjekk roller for admin-ruter (bruker det Aktive/Nye tokenet)
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const role = sessionManager.getUserRole(activeToken!);

    if (role?.toLowerCase() !== "admin") {
      const newUrl = new URL("/404", req.url);
      return NextResponse.redirect(newUrl);
    }
  }

  return response;
};

const handleLogout = (req: NextRequest) => {
  const loginUrl = new URL("/login?expired=true", req.url);
  const redirectRes = NextResponse.redirect(loginUrl);
  redirectRes.cookies.delete("token");
  redirectRes.cookies.delete("refreshToken");
  redirectRes.cookies.delete("user_data");
  return redirectRes;
};

export default proxy;