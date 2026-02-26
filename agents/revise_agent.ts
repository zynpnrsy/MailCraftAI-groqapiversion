import { groq } from "@/lib/groq";
import type { ResponseAgentResult } from "./response_agent";
import type { CriticAgentResult } from "./critic_agent";

export interface ReviseAgentParams {
  emailText: string;
  summary: string;
  classification: string;
  previousResponse: ResponseAgentResult;
  critic: CriticAgentResult;
}

export async function reviseAgent({
  emailText,
  summary,
  classification,
  previousResponse,
  critic
}: ReviseAgentParams): Promise<ResponseAgentResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a senior customer support assistant. You will be given an original reply and a critique describing what is wrong with it. Rewrite the reply to fully address the critique while staying accurate to the email content. Do NOT invent order numbers or facts."
      },
      {
        role: "user",
        content: `EMAIL:\n${emailText}\n\nSUMMARY:\n${summary}\n\nCLASSIFICATION: ${classification}\n\nPREVIOUS REPLY:\n${previousResponse.reply}\n\nCRITIC FEEDBACK:\n${critic.critique}\n\nWrite an improved reply.`
      }
    ]
  });

  const reply = completion.choices[0].message.content || "";

  const usernameMatch =
    emailText.match(/(?:hi|hello|dear)\s+([A-Z][a-zA-Z]+)/i) ||
    emailText.match(/name[:\-]\s*([A-Z][a-zA-Z]+)/i);
  const orderMatch =
    emailText.match(/order(?:\s*number|#| no\.?)?\s*[:\-]?\s*([A-Z0-9\-]+)/i) ||
    emailText.match(/\b([A-Z0-9]{6,})\b/);

  return {
    reply,
    username: usernameMatch ? usernameMatch[1] : null,
    orderNumber: orderMatch ? orderMatch[1] : null
  };
}

