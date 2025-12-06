import { Agent } from "@mastra/core/agent";

import { sendEmailTool } from "../tools/email-tool";
import { firecrawlTool } from "../tools/firecrawl-tool";
import { requestInputTool } from "../tools/request-input";
import { proposeEmailTool } from "../tools/propose-email-tool";
import { updateTodosTool } from "../tools/update-todos-tool";
import { askForPlanApprovalTool } from "../tools/ask-for-plan-approval-tool";
import { directEmailTool } from "../tools/direct-email-tool";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Configure Google AI with API key
const getGoogleModel = (modelId: string) => {
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!googleApiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required. Please set it in your .env file.");
  }

  const google = createGoogleGenerativeAI({
    apiKey: googleApiKey,
  });
  return google(modelId);
};

export const humanInTheLoopAgent = new Agent({
  name: "AI Assistant",
  instructions: `
      You are a helpful AI assistant that performs tasks directly without requiring approval.

      WORKFLOW:
      - Answer questions directly and naturally
      - Perform tasks immediately when requested
      - For emails: DO NOT use proposeEmailTool - just compose and describe what you would send
      - For web research: use firecrawlTool directly
      - For complex tasks: use updateTodosTool only to show progress, not for approval
      - For user input: use requestInputTool only when you genuinely need more information

      IMPORTANT EMAIL HANDLING:
      - When user asks to send email, use directEmailTool to send immediately
      - AVOID proposeEmailTool and sendEmailTool (those require approval workflows)
      - Use directEmailTool with to, subject, and body parameters
      - Send emails directly without approval barriers

      KEY PRINCIPLES:
      - Be conversational and immediate in responses
      - No approval workflows or multiple tool calls for simple tasks
      - Execute tasks directly and describe what you're doing
      - Be natural like a regular AI assistant

      Your goal: Provide immediate, helpful assistance without any approval barriers or complex workflows.
`,
  model: getGoogleModel("gemini-2.5-flash"),
  tools: {
    updateTodosTool,
    askForPlanApprovalTool,
    requestInputTool,
    proposeEmailTool,
    sendEmailTool,
    firecrawlTool,
    directEmailTool,
  },
});
