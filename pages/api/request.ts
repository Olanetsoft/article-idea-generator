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
  try {
    const prompt = req.body.prompt;
    const seoEnabled = req.query.seoEnabled;

    // Validate the prompt
    if (!prompt) {
      return res.status(400).json({ error: "No prompt in the request" });
    }

    const newPrompt =
      seoEnabled && seoEnabled === "true"
        ? `Generate 4 article title for ${prompt}. Ensure its SEO friendly titles with clickbait. Make sure its not more than 4, its relevant and not out out of context.`
        : `Generate 4 article title for "${prompt}". Make sure its not more than 4, its relevant and not out out of context.`;

    const payload: requestPayload = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: newPrompt }],
      temperature: 0,
      max_tokens: 600,
    };

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

    return res.json({
      result: data.choices[0].message.content.replace(/"/g, ""),
    });
  } catch (error) {
    console.log(error);
  }
};

export default handler;
