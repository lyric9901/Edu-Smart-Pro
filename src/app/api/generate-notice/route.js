import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edu-smart-pro.vercel.app", 
        "X-Title": "Edu Smart Pro",
      },
      body: JSON.stringify({
        // CHANGE THIS LINE BELOW:
        model: "deepseek/deepseek-chat", // DeepSeek V3 (Standard)
        // OR Use this for the specific free version if available:
        // model: "deepseek/deepseek-r1:free", 
        
        messages: [
          {
            role: "system",
            content: "You are a professional school administrator. Rewrite the following rough draft into a clear, polite, and professional school notice. Keep it concise."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    const refinedText = data.choices?.[0]?.message?.content || prompt;

    return NextResponse.json({ content: refinedText });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate notice" }, { status: 500 });
  }
}
