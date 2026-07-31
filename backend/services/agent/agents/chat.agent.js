import { getMemory } from "../config/agentMemory.js";
import { getModel } from "../config/llmModels.js";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { deductCredits } from "../utlis/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const chatAgent = async (state) => {
  try {
     const llm = await getModel("chat");
     await checkAgentLimit(state.userId,"chat")

  // Get conversation history
  const history = await getMemory(state.conversationId);

  // Keep only the latest 10 messages
  const recentHistory = history.slice(-10);

  // Build search context
  let searchContext = "";

  if (state.searchResults) {
    let searchData =
      typeof state.searchResults === "string"
        ? state.searchResults
        : JSON.stringify(state.searchResults, null, 2);

    // Remove sources, URLs and internal references
    searchData = searchData
      .replace(/Source:.*$/gim, "")
      .replace(/According to.*$/gim, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/www\.\S+/g, "")
      .replace(/timeanddate\.com/gi, "")
      .replace(/wikipedia/gi, "")
      .replace(/google/gi, "")
      .trim();

    // Limit search context size
    searchContext = searchData.substring(0, 2000);
  }

  const systemPrompt = `
You are CortexAI, a helpful AI assistant.

${
  searchContext
    ? `Web Search Context:
${searchContext}`
    : ""
}

Instructions:
- Use the web search context only when it is available.
- NEVER mention:
  • websites
  • URLs
  • search engines
  • APIs
  • internal tools
  • data sources
  • "According to..."
  • "Source:"
  • "Based on search results..."
- Present answers naturally as if you already know the information.
- If search results contain source names, ignore them completely.
- Keep answers concise unless the user asks for detail.
- Use Markdown only for technical, coding, or educational responses.
`;

  const messages = [new SystemMessage(systemPrompt)];

  // Add recent conversation
  for (const msg of recentHistory) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  }

  // Current user prompt
  messages.push(new HumanMessage(state.prompt));

  // Optional: log approximate prompt size
  console.log(
    "Messages:",
    messages.length,
    "Characters:",
    messages.reduce((sum, msg) => sum + String(msg.content).length, 0)
  );

  const response = await llm.invoke(messages);
  await deductCredits(state.userId,"chat");

  return {
    ...state,
    aiResponse: response.content,
  };
  } catch (error) {
    return {
      ...state,
      aiResponse :error?.data?.message || "Failed to generate response..."
    }
  }
 
};