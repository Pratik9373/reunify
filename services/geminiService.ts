
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToPart = (base64String: string): { inlineData: { data: string; mimeType: string } } => {
  const mimeType = base64String.match(/data:(.*?);/)?.[1] || 'image/png';
  const data = base64String.split(',')[1] || base64String;
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export const generateReunion = async (childPhoto: File, adultPhoto: File): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const childPart = await fileToPart(childPhoto);
  const adultPart = await fileToPart(adultPhoto);

  const prompt = `Create a single, highly realistic and heartwarming photo where the person from the child photo (first image) and the person from the adult photo (second image) are hugging each other. They should look like the same person at different ages interacting naturally. The adult should be embracing the child. Apply soft, natural lighting. The background must be replaced with a clean, smooth, pure white background. The final image should look professional and emotive.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [childPart, adultPart, { text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating reunion:", error);
    throw error;
  }
};

export const applyImageEdit = async (currentImageUrl: string, userPrompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const imagePart = base64ToPart(currentImageUrl);

  const systemPrompt = `Modify the provided image according to this instruction: "${userPrompt}". Maintain the identity of the people in the image. Ensure the output is high quality.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [imagePart, { text: systemPrompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error applying edit:", error);
    throw error;
  }
};
