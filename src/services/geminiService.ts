import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedTaskIdea, Task, SubmissionProof } from "../types";
import { TaskType, ProofType } from "../types";

// FIX: Per coding guidelines, the API key must be read from process.env.API_KEY.
// This also resolves the TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
// Ensure the API key is available from environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "A short, catchy title for the task. Maximum 10 words."
            },
            description: {
                type: Type.STRING,
                description: "A brief, clear description of what the user needs to do. Maximum 40 words."
            },
            type: {
                type: Type.STRING,
                enum: Object.values(TaskType),
                description: "The most fitting category for this task."
            },
            proofType: {
                 type: Type.STRING,
                 enum: Object.values(ProofType),
                 description: "The type of proof required from the user."
            },
            proofQuestion: {
                type: Type.STRING,
                description: "A clear question or instruction for the user on what proof to submit. E.g., 'Please provide a link to your post.' or 'What was the best feature and why?'"
            }
        },
        required: ["title", "description", "type", "proofType", "proofQuestion"]
    }
};

export async function generateTaskIdeas(projectGoal: string): Promise<GeneratedTaskIdea[]> {
    try {
        const prompt = `
            Based on the following project goal, generate exactly 3 diverse micro-task ideas that a project owner could post on a task marketplace.
            The ideas should be simple, clear, and actionable for users.
            Ensure the 'type' and 'proofType' for each task are one of the allowed enum values.
            The 'proofQuestion' must be a direct instruction to the user.

            Project Goal: "${projectGoal}"
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (!Array.isArray(parsedResponse)) {
            throw new Error("Invalid response format from API. Expected an array.");
        }
        
        return parsedResponse.filter(idea => 
            idea &&
            typeof idea.title === 'string' &&
            typeof idea.description === 'string' &&
            Object.values(TaskType).includes(idea.type) &&
            Object.values(ProofType).includes(idea.proofType) &&
            typeof idea.proofQuestion === 'string'
        ) as GeneratedTaskIdea[];

    } catch (error) {
        console.error("Error generating task ideas with Gemini API:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
}

/**
 * Verifies a submission using AI. For demo purposes, this focuses on link-based tasks.
 * A real implementation would need to handle different proof types and might even use web scraping.
 */
export async function verifySubmissionWithAI(task: Task, proof: SubmissionProof): Promise<boolean> {
    // This function is a simulation. In a real app, you might fetch the content of the link.
    // For now, we will use Gemini to analyze the task description and the submitted link/text.
    if (task.type !== TaskType.SOCIAL_MEDIA_SHARE || !proof.link) {
        // AI verification is currently only mocked for social media link shares.
        return false;
    }

    try {
        const prompt = `
            Analyze the following micro-task and the user's submission.
            The goal is to determine if the submission likely meets the task requirements.
            Respond with only a single word: "APPROVE" or "REJECT".

            Task Description: "${task.description}"
            User Submitted Link: "${proof.link}"

            Analysis Criteria:
            1. Does the link appear to be a valid URL for a social media platform (like twitter.com, facebook.com, etc.)?
            2. Based on the task description, does the URL plausibly fulfill the request? (e.g., does the task mention X/Twitter and the link is a twitter.com link?).

            Your response must be "APPROVE" or "REJECT".
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.1,
                thinkingConfig: { thinkingBudget: 0 } // Low latency needed
            },
        });

        const decision = response.text.trim().toUpperCase();
        
        // Simple mock check for keywords. A real app might have more robust logic.
        const containsHashtag = (task.description.match(/#\w+/g) || []).some(hashtag => task.description.includes(hashtag));
        const linkLooksPlausible = decision === 'APPROVE';

        return linkLooksPlausible && containsHashtag;

    } catch (error) {
        console.error("Error verifying submission with Gemini API:", error);
        // Default to manual review if AI fails
        return false;
    }
}
