import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/app/lib/system-prompt";

// GitHub Models API — uses OpenAI SDK with custom baseURL
const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        {
          error:
            "GitHub Token not configured. Create a .env.local file and add: GITHUB_TOKEN=ghp_your_token_here",
        },
        { status: 500 }
      );
    }

    // Call GitHub Models API (OpenAI-compatible) with streaming
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Available: gpt-4o, gpt-4o-mini, Meta-Llama-3.1-405B, etc.
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10), // Keep last 10 messages for context window
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    // Create SSE stream for real-time response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);

    // Handle specific GitHub Models API errors
    let errorMessage = "Something went wrong. Please try again.";

    if (error?.status === 401) {
      errorMessage =
        "Invalid GitHub Token. Check your GITHUB_TOKEN in .env.local";
    } else if (error?.status === 429) {
      errorMessage =
        "Rate limit exceeded. GitHub Models has usage limits — wait a moment and try again.";
    } else if (error?.status === 404) {
      errorMessage =
        "Model not found. Check the model name in app/api/chat/route.ts";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
