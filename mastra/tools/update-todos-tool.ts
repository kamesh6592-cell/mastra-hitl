import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Type definitions for better type safety
type TodoStatus = "new" | "pending" | "in-progress" | "done";

interface Todo {
  text: string;
  status: TodoStatus;
}

interface UpdateTodosContext {
  new: string[];
  inProgress: number[];
  done: number[];
  clearPreviouslyDone: boolean;
  insertAt?: number;
}

// Schema definitions
const todoSchema = z.object({
  text: z.string(),
  status: z.enum(["new", "pending", "in-progress", "done"]),
});

const outputSchema = z.object({
  todos: z.array(todoSchema),
});

// Helper functions for cleaner code
const findPreviousTodos = (messages: any[] | undefined): Todo[] => {
  if (!messages || !Array.isArray(messages)) {
    return [];
  }

  // Traverse messages in reverse to find the most recent updateTodos output
  for (let i = messages.length - 1; i >= 0; i--) {
    const todos = extractTodosFromMessage(messages[i]);
    if (todos.length > 0) {
      return todos;
    }
  }

  return [];
};

const extractTodosFromMessage = (message: any): Todo[] => {
  if (!message?.content || !Array.isArray(message.content)) {
    return [];
  }

  for (const content of message.content) {
    if (isUpdateTodosResult(content)) {
      try {
        const result = outputSchema.parse(content.output.value);
        if (result.todos && Array.isArray(result.todos)) {
          return result.todos;
        }
      } catch (error) {
        // Invalid schema, continue searching
        console.error("Failed to parse todos:", error);
      }
    }
  }

  return [];
};

const isUpdateTodosResult = (content: any): boolean => {
  return (
    content?.type === "tool-result" &&
    (content?.toolName === "updateTodosTool" ||
      content?.toolName === "askForPlanApprovalTool") &&
    "output" in content
  );
};

const applyTodoUpdates = (
  currentTodos: Todo[],
  updates: UpdateTodosContext,
): Todo[] => {
  let updatedTodos = [...currentTodos];

  // Automatically transition 'new' todos to 'pending' if they're not being updated
  updatedTodos = updatedTodos.map((todo, index) => {
    // If this todo is being explicitly updated, don't auto-transition
    if (updates.inProgress.includes(index) || updates.done.includes(index)) {
      return todo;
    }
    // Auto-transition from 'new' to 'pending'
    if (todo.status === "new") {
      return { ...todo, status: "pending" as TodoStatus };
    }
    return todo;
  });

  // Clear previously done items if requested
  if (updates.clearPreviouslyDone) {
    updatedTodos = updatedTodos.filter((todo) => todo.status !== "done");
  }

  // Add new todos with 'new' status
  const newTodos: Todo[] = updates.new.map((text) => ({
    text,
    status: "new" as TodoStatus,
  }));

  // Insert new todos at specified position or at the end
  if (updates.insertAt !== undefined && updates.insertAt >= 0) {
    // Ensure insertAt doesn't exceed array bounds
    const insertPosition = Math.min(updates.insertAt, updatedTodos.length);
    updatedTodos.splice(insertPosition, 0, ...newTodos);
  } else {
    // Default: add to the end
    updatedTodos.push(...newTodos);
  }

  // Update status for in-progress items
  updateTodoStatuses(updatedTodos, updates.inProgress, "in-progress");

  // Update status for done items
  updateTodoStatuses(updatedTodos, updates.done, "done");

  return updatedTodos;
};

const updateTodoStatuses = (
  todos: Todo[],
  indices: number[],
  status: TodoStatus,
): void => {
  for (const index of indices) {
    if (isValidIndex(index, todos)) {
      todos[index].status = status;
    }
  }
};

const isValidIndex = (index: number, array: any[]): boolean => {
  return index >= 0 && index < array.length;
};

// Main tool definition
export const updateTodosTool = createTool({
  id: "update-todos",
  description:
    "Manage and update a task list to communicate progress and planned actions. Keep the list current throughout the interaction to maintain transparency about ongoing and planned work.",
  inputSchema: z.object({
    new: z.array(z.string()).describe("Array of new todo items to add"),
    inProgress: z
      .array(z.number())
      .describe("Array of indices of todos to mark as in progress"),
    done: z
      .array(z.number())
      .describe("Array of indices of todos to mark as done"),
    clearPreviouslyDone: z
      .boolean()
      .default(false)
      .describe(
        "Whether to remove all previously completed todos from the list",
      ),
    insertAt: z
      .number()
      .optional()
      .describe(
        "Index at which to insert new items (0 for beginning, defaults to end of list)",
      ),
  }),
  outputSchema,
  execute: async ({ context }, options) => {
    const { messages } = options || {};

    // Retrieve previous todos from message history
    const currentTodos = findPreviousTodos(messages);

    // Check for recent plan approvals - if found, prevent new todo creation
    if (messages && context.new && context.new.length > 0) {
      const recentApprovals = messages
        .slice(-10) // Check last 10 messages
        .some(msg => 
          JSON.stringify(msg).includes("PLAN APPROVED") || 
          JSON.stringify(msg).includes('"approved":true')
        );
      
      if (recentApprovals && currentTodos.length > 0) {
        // Don't add new todos if there's a recent approval and existing todos
        console.warn("Blocking duplicate todo creation - plan already approved");
        context.new = [];
      }
    }

    // Check if we're trying to add duplicate todos
    if (context.new && context.new.length > 0) {
      const existingTexts = currentTodos.map(todo => todo.text.toLowerCase());
      const duplicateNew = context.new.filter(text => 
        existingTexts.includes(text.toLowerCase())
      );
      
      if (duplicateNew.length > 0) {
        // Filter out duplicates silently
        context.new = context.new.filter(text => 
          !existingTexts.includes(text.toLowerCase())
        );
      }
    }

    // If no new todos to add and no status updates, just return current todos
    if (context.new.length === 0 && 
        context.inProgress.length === 0 && 
        context.done.length === 0 &&
        !context.clearPreviouslyDone) {
      return {
        todos: currentTodos,
      };
    }

    // Apply updates to the todo list
    const updatedTodos = applyTodoUpdates(currentTodos, context);

    return {
      todos: updatedTodos,
    };
  },
});
