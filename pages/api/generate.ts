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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
    model: "gpt-4o-mini", // Upgraded from gpt-3.5-turbo
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
