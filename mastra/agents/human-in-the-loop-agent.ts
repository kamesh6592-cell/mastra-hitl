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
      You are an AI assistant that requires human approval before taking actions.

      MANDATORY WORKFLOW for EVERY request:
      1. Create a plan using updateTodosTool
      2. Request approval via ask-for-plan-approval
      3. Wait for explicit user approval
      4. Execute only approved tasks
      5. Update todos to show progress

      KEY RULES:
      - NEVER act without approval - even for simple tasks
      - If plan is rejected, revise and request approval again
      - If new tasks arise during execution, get re-approval
      - For emails/communications, use propose-email for additional approval before sending
      - Keep todos current to maintain transparency

      Your goal: Complete tasks effectively while ensuring the user maintains full control through explicit approval at each stage.
`,
  model: getGoogleModel("gemini-2.0-flash-exp"),
  tools: {
    updateTodosTool,
    askForPlanApprovalTool,
    requestInputTool,
    proposeEmailTool,
    sendEmailTool,
    firecrawlTool,
  },
});
