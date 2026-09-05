import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function verifyPaymentScreenshot(imageFile: File | Buffer, mimeType: string): Promise<string> {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI payment screenshot verification.");
    return "needs_review";
  }
  
  try {
    let dataPart;
    if (Buffer.isBuffer(imageFile)) {
      dataPart = {
        inlineData: {
          data: imageFile.toString("base64"),
          mimeType
        }
      };
    } else {
      // It's a File object (e.g. from FormData)
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      dataPart = {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType
        }
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            dataPart,
            { text: "Analyze this payment screenshot. Is it a legitimate payment confirmation screenshot (e.g., Vodafone Cash or similar mobile wallet)? Reply exactly with one of these strings: likely_valid, needs_review, likely_invalid." }
          ]
        }
      ]
    });

    const result = response.text?.trim().toLowerCase() || "needs_review";
    if (["likely_valid", "needs_review", "likely_invalid"].includes(result)) {
      return result;
    }
    return "needs_review";
  } catch (error) {
    console.error("Error during AI vision check:", error);
    return "needs_review";
  }
}

export async function suggestGameArtwork(gameName: string): Promise<string> {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI artwork suggestion.");
    return "";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Suggest a high-quality prompt to generate a 16:9 premium gaming banner/icon for the game: ${gameName}. Just return the prompt string, nothing else.` }
          ]
        }
      ]
    });
    
    // We could use an Image generation model API here if we had one (like Imagen via Vertex), 
    // but the prompt is to use Gemini for suggestions. 
    // If the goal is actually fetching images, we might use a search API or return the prompt.
    // For now, returning the suggested prompt.
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error during AI artwork suggestion:", error);
    return "";
  }
}
