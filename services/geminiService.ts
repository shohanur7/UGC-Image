
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT = `
You are an expert creative director specializing in product photography. Your task is to combine two images into a single, photorealistic, and aesthetically pleasing lifestyle shot.

**Inputs:**
1.  **Product Image:** An image of a specific product.
2.  **Person/Influencer Image:** An image of a person.

**Goal:**
Create a new, high-quality, photorealistic image where the person from the second image is naturally and believably interacting with or using the product from the first image.

**Instructions:**
-   **Seamless Integration:** The product and person must look like they belong in the same scene. Pay close attention to lighting, shadows, reflections, and perspective to ensure a cohesive final image.
-   **Natural Interaction:** The person's pose, expression, and action should be natural and relevant to the product. It should look like a genuine moment, not a stiff or awkward pose.
-   **Aesthetic Scene:** Generate an appealing background/environment that complements the product and the person's style. The overall mood should be professional and suitable for marketing (e.g., bright and airy, cozy and warm, sleek and modern, depending on the product).
-   **Photorealism is Key:** The final output must look like a real photograph, not a digital composition or illustration. Avoid any uncanny or artificial-looking elements.
-   **Focus:** The product should be a clear focal point, but the overall image should tell a story about its use.
`;

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
    // remove the data:image/...;base64, prefix
    const data = base64Data.split(',')[1];
    return {
        inlineData: {
            data,
            mimeType,
        },
    };
};


export const generateProductImage = async (productImageBase64: string, influencerImageBase64: string): Promise<string> => {
    const productMimeType = productImageBase64.split(';')[0].split(':')[1];
    const influencerMimeType = influencerImageBase64.split(';')[0].split(':')[1];

    const productPart = fileToGenerativePart(productImageBase64, productMimeType);
    const influencerPart = fileToGenerativePart(influencerImageBase64, influencerMimeType);
    const textPart = { text: PROMPT };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [productPart, influencerPart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        // Loop through parts to find the generated image
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error('No image was generated in the response.');
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate image. The model may have refused the request due to safety policies or an internal error.");
    }
};
