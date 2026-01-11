import type { NextApiRequest, NextApiResponse } from "next";

if (!process.env.NEXT_PUBLIC_ENV_VARIABLE_OPEN_AI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export type ChatGPTAgent = "user" | "system";

// ChatGPTMessage interface
interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

interface requestPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  max_tokens: number;
}

// Simple in-memory rate limiting (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 10; // Maximum requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  // Increment count
  record.count += 1;
  return true;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get client IP address
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown";

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: "Rate limit exceeded. Please try again in a minute.",
    });
  }

  const { prompt, systemMessage } = req.body;

  // Validate the prompt
  if (!prompt) {
    return res.status(400).json({ error: "No prompt in the request" });
  }

  const messages: ChatGPTMessage[] = systemMessage
    ? [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ]
    : [{ role: "user", content: prompt }];

  const payload: requestPayload = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7, // Increased for more creative outputs
    max_tokens: 800, // Increased for longer abstracts
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          process.env.NEXT_PUBLIC_ENV_VARIABLE_OPEN_AI_API_KEY ?? ""
        }`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.status(500).json({ error: "Failed to generate content" });
  }
};

export default handler;
