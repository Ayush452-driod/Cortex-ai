import { getModel } from "../config/llmModels.js";
import axios from "axios";
import { uploadToS3 } from "../utlis/uploadToS3.js";
import { getFromS3 } from "../utlis/getFromS3.js";
import { deductCredits } from "../utlis/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const imageGenAgent = async (state) => {
    
  try {
    await checkAgentLimit(state.userId,"image")
    const llm = await getModel("image");

    const res = await llm.invoke(`
You are an elite AI image prompt engineer.

Convert the user's request into a highly detailed image generation prompt.

Requirements:
- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return ONLY the image prompt.

User Request:
${state.prompt}
`);

    const prompt = res.content.trim();


    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}`;


    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
    });

     await deductCredits(state.userId,"image")


    if (
      !imageRes.headers["content-type"] ||
      !imageRes.headers["content-type"].startsWith("image/")
    ) {
      throw new Error("Pollinations did not return an image.");
    }

    const buffer = Buffer.from(imageRes.data);
    const filename = `image-${Date.now()}.png`;

    await uploadToS3(filename, buffer, "image/png");

    const downloadUrl = await getFromS3(filename,24*60);
   return {
  ...state,
  aiResponse: `
# 🖼️ Your image is ready!

I've generated your image successfully.

Your image is ready to view and download.

### ⬇️ Download Image

[Download Image](${downloadUrl})

> ⏳ **This secure download link will expire in 10 minutes.**
`
};
  } catch (error) {
    console.error("Image Generation Error:");
    console.error(error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    }

    return {
      ...state,
      aiResponse: error?.data?.message || "Failed to generate image..."
    };
  }
};