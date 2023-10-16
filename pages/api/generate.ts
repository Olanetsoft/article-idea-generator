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
  // try {
  const prompt = req.body.prompt;

  // Validate the prompt
  if (!prompt) {
    return res.status(400).json({ error: "No prompt in the request" });
  }

  const payload: requestPayload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
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

  return res.json(data);
  // } catch (error) {
  // console.log(error);
  // }
};

export default handler;
