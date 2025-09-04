import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedTaskIdea, Task, SubmissionProof, TaskType, ProofType } from '../types';

if (!import.meta.env.VITE_API_KEY) {
  throw new Error("VITE_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const taskIdeaSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A short, clear, and engaging title for the task.'
      },
      description: {
        type: Type.STRING,
        description: 'A detailed description of what the user needs to do. Should be at least 2 sentences.'
      },
      type: {
        type: Type.STRING,
        enum: Object.values(TaskType),
        description: 'The category of the task.'
      },
      proofType: {
        type: Type.STRING,
        enum: Object.values(ProofType),
        description: 'The type of proof required from the user.'
      },
      proofQuestion: {
        type: Type.STRING,
        description: 'A clear question or instruction for the user on what proof to provide. E.g., "Please provide a screenshot of your post." or "What was the most interesting feedback you have?"'
      }
    },
    required: ['title', 'description', 'type', 'proofType', 'proofQuestion']
  }
};

export const generateTaskIdeas = async (goal: string): Promise<GeneratedTaskIdea[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the project goal "${goal}", generate 3 distinct micro-task ideas. The tasks should be simple and clear for users to complete.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskIdeaSchema,
      },
    });

    const jsonText = response.text.trim();
    const ideas = JSON.parse(jsonText);
    
    // Ensure the output is always an array
    if (Array.isArray(ideas)) {
        return ideas;
    } else {
        console.warn("AI did not return an array, returning empty array.");
        return [];
    }
  } catch (error) {
    console.error("Error generating task ideas:", error);
    throw new Error("Failed to communicate with the AI. Please check your API key and try again.");
  }
};


export const verifySubmissionWithAI = async (task: Task, proof: SubmissionProof): Promise<boolean> => {
    try {
        let proofContent = '';
        if (proof.text) proofContent = `Text submitted: "${proof.text}"`;
        else if (proof.link) proofContent = `Link submitted: "${proof.link}"`;
        else if (proof.imageUrl) proofContent = `An image was submitted.`;
        else proofContent = "No proof was submitted.";

        const prompt = `
            A user submitted a proof for the following task. Please verify if it's a valid completion.
            Task Title: "${task.title}"
            Task Description: "${task.description}"
            Proof Required: "${task.proofQuestion}"
            
            User's Submission:
            ${proofContent}

            Based on the submission, does it plausibly fulfill the task requirements? Respond with only "yes" or "no".
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const decision = response.text.trim().toLowerCase();
        return decision.includes('yes');

    } catch (error) {
        console.error("Error verifying submission with AI:", error);
        // Default to false (manual review) if AI fails
        return false;
    }
};
