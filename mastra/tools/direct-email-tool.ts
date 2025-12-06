import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Check if Resend API key is configured
const hasResendKey = () => {
  return !!process.env.RESEND_API_KEY;
};

const getResendClient = async () => {
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
};

export const directEmailTool = createTool({
  id: "direct-email",
  description: "Send an email directly without approval workflow",
  inputSchema: z.object({
    to: z.string().email("Please provide a valid email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body content"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      // Check if Resend API key is configured
      if (!hasResendKey()) {
        return {
          success: false,
          message: "Email sending is not configured. Please add a RESEND_API_KEY to your .env file to enable email functionality.",
        };
      }

      const resend = await getResendClient();
      
      await resend.emails.send({
        from: "Assistant <onboarding@resend.dev>",
        to: [context.to],
        subject: context.subject,
        text: context.body,
      });

      return {
        success: true,
        message: `Email sent successfully to ${context.to}`,
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});