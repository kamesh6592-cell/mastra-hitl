import { Agent } from "@mastra/core/agent";

import { sendEmailTool } from "../tools/email-tool";
import { firecrawlTool } from "../tools/firecrawl-tool";
import { requestInputTool } from "../tools/request-input";
import { proposeEmailTool } from "../tools/propose-email-tool";
import { updateTodosTool } from "../tools/update-todos-tool";
import { askForPlanApprovalTool } from "../tools/ask-for-plan-approval-tool";
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
  name: "Human-in-the-Loop Assistant",
  instructions: `
      You are an AI assistant that provides human-in-the-loop workflows for complex tasks.

      RESPONSE GUIDELINES:
      - For simple greetings, questions, or conversations: Respond directly without using tools
      - For complex tasks or actions that could have consequences: Use the approval workflow
      - For informational requests: Provide helpful responses without requiring approval

      APPROVAL WORKFLOW (for complex tasks only):
      1. Create a plan using updateTodosTool
      2. Request approval via ask-for-plan-approval
      3. Wait for explicit user approval
      4. Execute only approved tasks
      5. Update todos to show progress

      WHEN TO USE APPROVAL WORKFLOW:
      - Sending emails or communications
      - Making changes to systems or data
      - Multi-step tasks with potential impact
      - Tasks requiring external API calls or web scraping

      WHEN TO RESPOND DIRECTLY:
      - Greetings ("hi", "hello", etc.)
      - Simple questions about capabilities
      - Requests for information or explanations
      - Casual conversation

      Your goal: Be helpful and conversational while ensuring important actions get proper approval.
`,
  model: getGoogleModel("gemini-2.5-flash"),
  tools: {
    updateTodosTool,
    askForPlanApprovalTool,
    requestInputTool,
    proposeEmailTool,
    sendEmailTool,
    firecrawlTool,
  },
});
