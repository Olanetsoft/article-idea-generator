import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { NextApiRequest, NextApiResponse } from "next";
import type { GetServerSidePropsContext } from "next";
import type { Database } from "@/types/database";

// Helper to append a Set-Cookie header without overwriting existing ones
function appendSetCookie(
  res: NextApiResponse | GetServerSidePropsContext["res"],
  cookie: string,
) {
  const existing = res.getHeader("Set-Cookie");
  let cookies: string[];

  if (!existing) {
    cookies = [];
  } else if (Array.isArray(existing)) {
    cookies = existing as string[];
  } else {
    cookies = [existing as string];
  }

  cookies.push(cookie);
  res.setHeader("Set-Cookie", cookies);
}

// For API routes
export function createApiClient(req: NextApiRequest, res: NextApiResponse) {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookie = `${name}=${value}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge};` : ""} ${options.httpOnly ? "HttpOnly;" : ""} ${options.secure ? "Secure;" : ""} SameSite=Lax`;
          appendSetCookie(res, cookie);
        },
        remove(name: string, options: CookieOptions) {
          const cookie = `${name}=; Path=/; Max-Age=0`;
          appendSetCookie(res, cookie);
        },
      },
    },
  );
}

// For getServerSideProps
export function createServerClient(
  req: GetServerSidePropsContext["req"],
  res: GetServerSidePropsContext["res"],
) {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookies = req.cookies as Record<string, string>;
          return cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookie = `${name}=${value}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge};` : ""} ${options.httpOnly ? "HttpOnly;" : ""} ${options.secure ? "Secure;" : ""} SameSite=Lax`;
          appendSetCookie(res, cookie);
        },
        remove(name: string, options: CookieOptions) {
          const cookie = `${name}=; Path=/; Max-Age=0`;
          appendSetCookie(res, cookie);
        },
      },
    },
  );
}
