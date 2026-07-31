import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModels.js";
import { deductCredits } from "../utlis/deductCredits.js";

export const codingAgent = async (state) => {
  try {
   await checkAgentLimit(state.userId,"coding")
  const intentLLM = await getModel("intent");
  const llm = await getModel("coding");

  const intentRes = await intentLLM.invoke(`
You are an intent classifier.

Return ONLY one of these values.
CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
CONVERSATION
DOCUMENTATION

User Request:
${state.prompt}
`);

  const intent = intentRes.content.trim();

  let prompt = "";

  if (intent === "CODE_GENERATION") {
    prompt = `
You are CortexAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

IMAGES
========================

Always use real Unsplash images.

Never use placeholders.

Return ONLY valid JSON.

Schema:
{
  "files":[
    {
      "name":"index.html",
      "content":"..."
    },
    {
      "name":"style.css",
      "content":"..."
    },
    {
      "name":"script.js",
      "content":"..."
    }
  ]
}

Rules:
- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
`;

    const res = await llm.invoke(prompt);

    let content = res.content.trim();

    // Remove markdown code fences if present
    content = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    // Extract JSON object if the model added extra text
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      content = content.slice(start, end + 1);
    }

    let data;

    try {
      data = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse AI response:");
      console.error(content);

      return {
        ...state,
        aiResponse:
          "Sorry, the AI returned an invalid project format. Please try again.",
        artifacts: [],
      };
    }
 
   await deductCredits(state.userId,"coding")

    return {
      ...state,
      aiResponse: "Code Generated Successfully.",
      artifacts: [
        {
          id: Date.now(),
          type: "Project",
          files: data.files || [],
          title: state.prompt,
        },
      ],
    };
  }

  const res = await llm.invoke(`
The user's request is:
${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview
## Explanations
## Problems
## Improvements
## Best Practices
## Optimized Code (if needed)

User Request:
${state.prompt}
`);

  await deductCredits(state.userId,"coding")

  return {
    ...state,
    aiResponse: res.content,
    artifacts: [],
  };
  } catch (error) {
    return {
      ...state,
      aiResponse: error?.data?.message || "Failed to generate code...",
      artifacts: [],
    };
  }
}