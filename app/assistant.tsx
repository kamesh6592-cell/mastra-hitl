"use client";

import { AssistantCloud, AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  HumanInTheLoopEmailTool,
  RequestInputToolUI,
  ProposeEmailToolUI,
} from "@/components/tools/human-in-the-loop";
import { UpdateTodosToolUI } from "@/components/tools/todo";
import { AskForPlanApprovalToolUI } from "@/components/tools/plan-approval";
import {
  FirecrawlToolUI,
  SendEmailToolUI,
} from "@/components/tools/automation";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";

export const Assistant = () => {
  const runtime = useChatRuntime({
    cloud: new AssistantCloud({
      baseUrl:
        process.env.NEXT_PUBLIC_ASSISTANT_CLOUD_URL ||
        "https://proj-0d1uavfgy8fj.assistant-api.com",
      anonymous: true,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread />
              <HumanInTheLoopEmailTool />
              <RequestInputToolUI />
              <ProposeEmailToolUI />
              <UpdateTodosToolUI />
              <AskForPlanApprovalToolUI />
              <FirecrawlToolUI />
              <SendEmailToolUI />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
