
import { GoogleGenAI, Type } from "@google/genai";
import { Carrier, Status } from "../types";

export const parseEmailWithGemini = async (emailText: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract package shipment details from the following email text. If data is missing, make reasonable guesses based on context. Return exactly one package object.
    
    Email Content:
    ${emailText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the item or order" },
          carrier: { 
            type: Type.STRING, 
            enum: Object.values(Carrier),
            description: "The shipping carrier" 
          },
          trackingNumber: { type: Type.STRING, description: "The tracking number" },
          status: { 
            type: Type.STRING, 
            enum: Object.values(Status),
            description: "Current shipment status" 
          },
          estimatedDelivery: { type: Type.STRING, description: "Estimated delivery date in ISO format" }
        },
        required: ["name", "carrier", "trackingNumber", "status"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
};
