import { groq } from "@/lib/groq";

export async function readerAgent(email: string) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "Summarize the following email in 2-3 sentences including key intent, sentiment, and any product/order references."
      },
      { role: "user", content: email }
    ]
  });

  return completion.choices[0].message.content || "";
}
