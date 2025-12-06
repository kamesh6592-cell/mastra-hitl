import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Type definitions for better type safety
type TodoStatus = "new" | "pending" | "in-progress" | "done";

interface Todo {
  text: string;
  status: TodoStatus;
}

interface UpdateTodosContext {
  new?: string[];
  inProgress?: number[];
  done?: number[];
  clearPreviouslyDone?: boolean;
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
  try {
    if (!message || !message.content) {
      return [];
    }

    // Handle array of content items
    const contentArray = Array.isArray(message.content) ? message.content : [message.content];
    
    for (const content of contentArray) {
      // Check for tool call results
      if (content.type === "tool-call" && 
          (content.toolName === "updateTodosTool" || content.toolName === "update-todos-tool") &&
          content.result && 
          content.result.todos) {
        return content.result.todos;
      }

      // Check for direct todos in content
      if (content.todos && Array.isArray(content.todos)) {
        return content.todos;
      }
    }

    // Check for todos directly in message
    if (message.todos && Array.isArray(message.todos)) {
      return message.todos;
    }

    return [];
  } catch (error) {
    console.warn('Error extracting todos from message:', error);
    return [];
  }
};

const applyUpdatesToTodos = (currentTodos: Todo[], context: UpdateTodosContext): Todo[] => {
  let updatedTodos = [...currentTodos];

  // Clear previously completed todos if requested
  if (context.clearPreviouslyDone) {
    updatedTodos = updatedTodos.filter(todo => todo.status !== "done");
  }

  // Update status for existing todos
  if (context.inProgress) {
    context.inProgress.forEach(index => {
      if (index >= 0 && index < updatedTodos.length) {
        updatedTodos[index] = { ...updatedTodos[index], status: "in-progress" };
      }
    });
  }

  if (context.done) {
    context.done.forEach(index => {
      if (index >= 0 && index < updatedTodos.length) {
        updatedTodos[index] = { ...updatedTodos[index], status: "done" };
      }
    });
  }

  // Add new todos
  if (context.new && context.new.length > 0) {
    const newTodos: Todo[] = context.new.map(text => ({
      text: text.trim(),
      status: "new" as TodoStatus
    }));

    // Insert at specified position or append to end
    if (typeof context.insertAt === 'number' && context.insertAt >= 0) {
      const insertIndex = Math.min(context.insertAt, updatedTodos.length);
      updatedTodos.splice(insertIndex, 0, ...newTodos);
    } else {
      updatedTodos.push(...newTodos);
    }
  }

  return updatedTodos;
};

// Main tool definition
export const updateTodosTool = createTool({
  id: "update-todos-tool",
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

    // Apply the updates to create the new todo list
    const updatedTodos = applyUpdatesToTodos(currentTodos, context);

    return {
      todos: updatedTodos,
    };
  },
});
