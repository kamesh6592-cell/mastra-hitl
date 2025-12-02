import { mastra } from "@/mastra";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Validate messages to prevent empty content arrays
  const validatedMessages = messages.filter((msg: any) => {
    if (msg.content && Array.isArray(msg.content)) {
      return msg.content.length > 0;
    }
    return msg.content && msg.content.trim().length > 0;
  });

  if (validatedMessages.length === 0) {
    return Response.json({ error: "No valid messages provided" }, { status: 400 });
  }

  const agent = mastra.getAgent("humanInTheLoopAgent");

  const stream = await agent.stream(convertToModelMessages(validatedMessages), {
    format: "aisdk",
    maxSteps: 10,
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
}
