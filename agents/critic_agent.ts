import { groq } from "@/lib/groq";
import type { ResponseAgentResult } from "./response_agent";

export interface CriticAgentResult {
  approved: boolean;
  critique: string;
}

export async function criticAgent(params: {
  emailText: string;
  summary: string;
  classification: string;
  response: ResponseAgentResult;
}): Promise<CriticAgentResult> {
  const { emailText, summary, classification, response } = params;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a strict critic that checks email replies for correctness, tone, and whether they address the user's request. Respond ONLY in JSON with keys: approved (boolean), critique (string)."
      },
      {
        role: "user",
        content: `EMAIL:\n${emailText}\n\nSUMMARY:\n${summary}\n\nCLASSIFICATION: ${classification}\n\nPROPOSED REPLY:\n${response.reply}\n\nUSERNAME: ${response.username}\nORDER_NUMBER: ${response.orderNumber}\n\nReturn JSON now.`
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    return {
      approved: false,
      critique: "No response from model"
    };
  }

  try {
    const parsed = JSON.parse(content) as CriticAgentResult;
    return parsed;
  } catch {
    return {
      approved: false,
      critique: `Failed to parse critic JSON: ${content}`
    };
  }
}

