import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function groqChat(messages: { role: "user" | "assistant" | "system"; content: string }[], maxTokens = 2000) {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: maxTokens,
    temperature: 0.7,
    messages,
  });
  return res.choices[0].message.content ?? "";
}
