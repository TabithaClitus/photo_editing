
import { GoogleGenAI, Modality } from "@google/genai";

const getGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType,
    },
  };
};

const processAIImageResponse = async (responsePromise: Promise<any>): Promise<string> => {
    const response = await responsePromise;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("AI did not return an image.");
};

export const removeBackground = async (imageBase64: string): Promise<string> => {
  const ai = getGenAI();
  const imagePart = fileToGenerativePart(imageBase64, 'image/png');
  
  return processAIImageResponse(ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: "Remove the background of this image perfectly, leaving only the main subject. The background should be transparent." }
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  }));
};

export const applyAIPrompt = async (imageBase64: string, prompt: string): Promise<string> => {
  const ai = getGenAI();
  const imagePart = fileToGenerativePart(imageBase64, 'image/png');

  return processAIImageResponse(ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: `Apply the following edit to the image: "${prompt}". Respond with only the edited image.` }
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  }));
};

export const autoEnhance = async (imageBase64: string): Promise<string> => {
    const ai = getGenAI();
    const imagePart = fileToGenerativePart(imageBase64, 'image/png');
  
    return processAIImageResponse(ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart,
          { text: "Auto-enhance this photo to improve its lighting, color, and sharpness for a professional look. Return only the enhanced image." }
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    }));
};

export const faceRetouch = async (imageBase64: string): Promise<string> => {
    const ai = getGenAI();
    const imagePart = fileToGenerativePart(imageBase64, 'image/png');

    return processAIImageResponse(ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                { text: "Perform a gentle and natural face retouch on the person in this image. Smooth skin slightly, reduce minor blemishes, and brighten eyes, but keep it looking realistic. Return only the edited image." }
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    }));
};

export const sharpenImage = async (imageBase64: string): Promise<string> => {
    const ai = getGenAI();
    const imagePart = fileToGenerativePart(imageBase64, 'image/png');

    return processAIImageResponse(ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                { text: "Increase the sharpness and clarity of this image. Make the details crisper without adding unnatural artifacts. Return only the sharpened image." }
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    }));
};
