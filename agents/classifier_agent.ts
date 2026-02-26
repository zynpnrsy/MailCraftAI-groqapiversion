import { groq } from "@/lib/groq";

export async function classifierAgent(summary: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "Classify the email as one of: urgent, normal, spam. Respond ONLY with one word: urgent, normal, or spam."
      },
      { role: "user", content: summary }
    ]
  });

  return (completion.choices[0].message.content || "").trim().toLowerCase();
}
