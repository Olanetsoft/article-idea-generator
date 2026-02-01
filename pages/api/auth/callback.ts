import { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const code = req.query.code as string;
  // The redirect URL is stored in localStorage on the client side
  // We'll redirect to a page that reads it and redirects
  const next = (req.query.next as string) || "/auth/redirect";

  if (code) {
    const cookiesToSetLater: string[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies: { name: string; value: string }[] = [];
            for (const [name, value] of Object.entries(req.cookies)) {
              if (value) cookies.push({ name, value });
            }
            return cookies;
          },
          setAll(cookiesToSet) {
            const serializedCookies = cookiesToSet.map(
              ({ name, value, options }) =>
                serialize(name, value, {
                  path: options?.path || "/",
                  // IMPORTANT: Auth tokens must NOT be httpOnly so browser client can read them
                  httpOnly: false,
                  secure: process.env.NODE_ENV === "production",
                  sameSite:
                    (options?.sameSite as "lax" | "strict" | "none") || "lax",
                  maxAge: options?.maxAge,
                }),
            );
            cookiesToSetLater.push(...serializedCookies);
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // Set cookies BEFORE redirect
    if (cookiesToSetLater.length > 0) {
      res.setHeader("Set-Cookie", cookiesToSetLater);
    }

    if (!error) {
      res.redirect(303, next);
      return;
    }

    console.error("Auth callback error:", error);
  }

  // Redirect to error page or home
  res.redirect(303, "/?error=auth_callback_error");
}
