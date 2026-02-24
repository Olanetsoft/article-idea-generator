import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

interface ShareToken {
  token: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface ShortUrlRow {
  id: string;
  user_id: string | null;
  code: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const supabase = createApiClient(req, res);
  const { code } = req.query;

  if (typeof code !== "string") {
    return res.status(400).json({ error: "Invalid code" });
  }

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get the short URL and verify ownership
  const { data: shortUrlData, error: urlError } = await supabase
    .from("short_urls")
    .select("id, user_id, code")
    .eq("code", code)
    .single();

  if (urlError || !shortUrlData) {
    return res.status(404).json({ error: "URL not found" });
  }

  const shortUrl = shortUrlData as unknown as ShortUrlRow;

  if (shortUrl.user_id !== user.id) {
    return res.status(403).json({ error: "You do not own this URL" });
  }

  // POST: Create a new share token
  if (req.method === "POST") {
    const { expiresIn } = req.body || {}; // expiresIn in hours (optional)

    // Generate a unique token
    const token = nanoid(21);

    // Calculate expiration if provided
    let expiresAt: string | null = null;
    if (expiresIn && typeof expiresIn === "number" && expiresIn > 0) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + expiresIn);
      expiresAt = expirationDate.toISOString();
    }

    // Create the share token
    // Note: analytics_share_tokens table types may not be generated yet
    const shareTable = supabase.from("analytics_share_tokens");
    const insertData = {
      short_url_id: shortUrl.id,
      token,
      expires_at: expiresAt,
    };
    const { data: shareTokenData, error: createError } = await (
      shareTable.insert(insertData as never) as ReturnType<
        typeof shareTable.insert
      >
    )
      .select()
      .single();

    if (createError) {
      console.error("Error creating share token:", createError);
      return res.status(500).json({ error: "Failed to create share token" });
    }

    const shareToken = shareTokenData as ShareToken;

    // Build the share URL
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
    const shareUrl = `${baseUrl}/analytics/shared/${token}`;

    return res.status(201).json({
      token: shareToken.token,
      shareUrl,
      expiresAt: shareToken.expires_at,
      createdAt: shareToken.created_at,
    });
  }

  // GET: Get all share tokens for this URL
  if (req.method === "GET") {
    const shareTable = supabase.from("analytics_share_tokens");
    const { data: tokens, error: fetchError } = await (
      shareTable
        .select("token, created_at, expires_at, is_active")
        .eq("short_url_id" as never, shortUrl.id) as unknown as ReturnType<
        typeof shareTable.select
      >
    ).order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching share tokens:", fetchError);
      return res.status(500).json({ error: "Failed to fetch share tokens" });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
    const tokensWithUrls = (tokens as ShareToken[]).map((t) => ({
      ...t,
      shareUrl: `${baseUrl}/analytics/shared/${t.token}`,
    }));

    return res.status(200).json({ tokens: tokensWithUrls });
  }

  // DELETE: Revoke a share token
  if (req.method === "DELETE") {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const shareTable = supabase.from("analytics_share_tokens");
    const { error: deleteError } = await (
      shareTable
        .delete()
        .eq("short_url_id" as never, shortUrl.id) as ReturnType<
        typeof shareTable.delete
      >
    ).eq("token" as never, token);

    if (deleteError) {
      console.error("Error deleting share token:", deleteError);
      return res.status(500).json({ error: "Failed to revoke share token" });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
