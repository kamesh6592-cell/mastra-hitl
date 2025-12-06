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

CRITICAL STATE AWARENESS:
- Check the conversation history BEFORE creating any new plans
- If you see "PLAN APPROVED" in recent messages, DO NOT create a new plan
- If there are existing approved todos, EXECUTE them instead of planning again
- Only create new plans for genuinely NEW user requests

WORKFLOW:
1. FIRST: Check if there's already an approved plan in the conversation
2. If YES: Execute the approved tasks, don't create new plans
3. If NO: Create plan using updateTodosTool, then use askForPlanApprovalTool
4. After approval: Execute tasks by responding appropriately (greeting, answering, etc.)

EXECUTION RULES:
- For "Greet the user" - Simply respond with a greeting, don't create more plans
- For questions - Answer directly, don't create more plans  
- For tasks - Do the task, don't create more plans
- Update todos only to mark progress (mark tasks as done)

STOP CREATING DUPLICATE PLANS:
- If you see multiple "PLAN APPROVED" sections, you're doing it wrong
- One user request = One planning cycle maximum
- After approval, just execute the tasks naturally

Your goal: Execute approved tasks efficiently without endless planning loops.
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
