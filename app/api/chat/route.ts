import { mastra } from "@/mastra";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    console.log("Received messages:", JSON.stringify(messages, null, 2));

    // More robust message validation - handle both content and parts formats
    const validatedMessages = messages.map((msg: any) => {
      if (!msg) return null;
      
      // Handle messages with 'parts' array (Gemini format from logs)
      if (msg.parts && Array.isArray(msg.parts)) {
        const validParts = msg.parts.filter((part: any) => {
          if (part && typeof part === 'object' && part.text) {
            return part.text.trim().length > 0;
          }
          return false;
        });
        
        if (validParts.length === 0) return null;
        return { ...msg, parts: validParts };
      }
      
      // Handle messages with 'content' (standard format)
      if (msg.content) {
        if (Array.isArray(msg.content)) {
          const validContent = msg.content.filter((item: any) => {
            if (typeof item === 'string') return item.trim().length > 0;
            if (item && typeof item === 'object' && item.text) return item.text.trim().length > 0;
            if (item && typeof item === 'object' && item.type) return true; // Keep structured content
            return false;
          });
          
          if (validContent.length === 0) return null;
          return { ...msg, content: validContent };
        }
        
        if (typeof msg.content === 'string') {
          return msg.content.trim().length > 0 ? msg : null;
        }
      }
      
      return null;
    }).filter(Boolean);

    console.log("Validated messages:", JSON.stringify(validatedMessages, null, 2));

    if (validatedMessages.length === 0) {
      console.log("No valid messages found");
      return Response.json({ error: "No valid messages provided" }, { status: 400 });
    }

  const agent = mastra.getAgent("humanInTheLoopAgent");

  const stream = await agent.stream(convertToModelMessages(validatedMessages), {
    format: "aisdk",
    maxSteps: 5, // Reduced to prevent excessive tool calls
    modelSettings: {},
    onError: ({ error }: { error: any }) => {
      console.error("Mastra streamVNext onError", error);
    },
  });
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writer.merge(
          stream.toUIMessageStream().pipeThrough(
            new TransformStream({
              transform(chunk, controller) {
                if (
                  chunk.type === "start" &&
                  validatedMessages[validatedMessages.length - 1].role === "assistant"
                ) {
                  controller.enqueue({
                    ...chunk,
                    messageId: validatedMessages[validatedMessages.length - 1].id,
                  });
                } else {
                  controller.enqueue(chunk);
                }
              },
            }),
          ),
        );
      },
    }),
  });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
