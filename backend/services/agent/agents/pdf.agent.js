import {getModel} from "../config/llmModels.js"
import { generatePDF } from "../utlis/generatePDF.js";
import { getFromS3 } from "../utlis/getFromS3.js";
import { uploadToS3 } from "../utlis/uploadToS3.js";
import { deductCredits } from "../utlis/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";


export const pdfAgent = async(state)=>{
  try {
     await checkAgentLimit(state.userId,"pdf")
      const llm = await getModel("pdf");
      const prompt  = `
      You are an expert document writer.
      Return ONLY valid JSON.
      Do NOT return markdown.
      Do NOT return explanations.
      
      Structure :
      {
      "title" : "",
      "subtitle" :"",
      "sections" :[
      {
      "heading" : "",
      "points" : []
      }
      ]
      }
      Generate 4-8 sections.
      Each sections should have 3-6 concise bullet points.
      Topic : ${state.prompt}
      `
      const res = await llm.invoke(prompt)
      const data=JSON.parse(res.content)
      await deductCredits(state.userId,"pdf")
      
      const pdfBuffer = await generatePDF(data)

      const filename = `pdf-${Date.now()}.pdf`
      await uploadToS3(filename,pdfBuffer,"application/pdf")

      const downloadUrl = await getFromS3(filename,24*60)
      return {
  ...state,
  aiResponse: `
# 🖼️ Your PDF is ready!

I've converted your image into a PDF successfully.

## 📑 ${data.title}

Your document is ready to download.

### ⬇️ Download PDF

[Download PDF](${downloadUrl})

> ⏳ **This secure download link will expire in 10 minutes.**
`
};
  } catch (error) {
    console.log(error)
    return {
      ...state,
      aiResponse: error?.data?.message || "Failed to generate pdf..."
      
    }
  }
}