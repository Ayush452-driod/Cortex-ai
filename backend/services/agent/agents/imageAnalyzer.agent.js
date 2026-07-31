import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import { deductCredits } from "../utlis/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const imageAnalyzer = async (state) => {
   
  try {
    await checkAgentLimit(state.userId,"image")
    const imageBuffer = await fs.readFile(state.file.path);
    const base64Image = imageBuffer.toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `
You are CortexAI Image Analyzer.

Rules:
- Analyze only the uploaded image.
- Answer the user's question accurately.
- Extract any text from the image.
- Explain charts and tables if present.
- If something is unclear, say so.
- Use Markdown where helpful.

User Question:
${state.prompt || "Analyze the image"}
`,
        },
        {
          inlineData: {
            mimeType: state.file.mimetype,
            data: base64Image,
          },
        },
      ],
    },
  ],
});

    await deductCredits(state.userId, "image");

    return {
      ...state,
      aiResponse: result.response.text(),
    };
  } catch (err) {
    console.error("Gemini Error:");
  console.error(err);
  console.error(err.message);

  if (err.response) {
    console.error(await err.response.text());
  }
    return {
     ...state,
      aiResponse: error?.data?.message || "Failed to analyze image...",
    };
  } finally {
    await fs.unlink(state.file.path);
  }
};