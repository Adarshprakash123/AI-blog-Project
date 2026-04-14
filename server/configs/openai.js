import OpenAI from "openai";

let client;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
};

export const generateBlogContent = async (topic) => {
  const openai = getOpenAIClient();

  const prompt = `Write a polished blog post in markdown.
Topic: ${topic}

Requirements:
- Write a compelling title and short introduction.
- Use clear section headings.
- Keep the tone professional and easy to read.
- Add practical insights and examples where relevant.
- End with a short conclusion.
- Return markdown only.`;

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: prompt,
  });

  return response.output_text?.trim() || "";
};
