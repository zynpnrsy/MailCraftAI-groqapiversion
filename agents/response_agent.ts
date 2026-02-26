import { groq } from "@/lib/groq";

export interface ResponseAgentResult {
  reply: string;
  username: string | null;
  orderNumber: string | null;
}

export async function responseAgent(
  emailText: string,
  summary: string
): Promise<ResponseAgentResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
You are a customer support assistant.

1. Extract the user's first name if available.
2. Extract the order number if explicitly mentioned.
3. Write a polite and concise email reply in the same language.

Rules:
- Do NOT fabricate order numbers.
- If order number is not clearly present, return null.
- Respond ONLY in valid JSON format:

{
  "username": string | null,
  "orderNumber": string | null,
  "reply": string
}
        `
      },
      {
        role: "user",
        content: `ORIGINAL EMAIL:\n${emailText}\n\nSUMMARY:\n${summary}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    return {
      reply: "",
      username: null,
      orderNumber: null
    };
  }

  try {
    const parsed = JSON.parse(content) as ResponseAgentResult;
    return parsed;
  } catch {
    return {
      reply: content,
      username: null,
      orderNumber: null
    };
  }
}