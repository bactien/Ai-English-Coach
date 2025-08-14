

import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ConversationScenario, AdvancedConversationFeedback, AdvancedFeedback, ChatMessage, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A simple in-memory store for chat sessions
const chatStore: { [key: string]: Chat } = {};

export const getOrCreateChatSession = (scenario: ConversationScenario, isPro: boolean): Chat => {
  const sessionId = `${scenario.id}-${isPro ? 'pro' : 'free'}`;
  if (chatStore[sessionId]) {
    return chatStore[sessionId];
  }

  const baseSystemInstruction = `You are an AI English coach. Your name is Alex.
You are playing the role of "${scenario.character}" in a conversation about "${scenario.title}".
Your goal is to help the user practice their English in this specific context: ${scenario.context}.
Engage in a natural, supportive conversation. Keep your in-character responses concise (1-3 sentences).
After your character's response, you MUST provide brief, actionable feedback on the user's previous statement.`;

  const proSystemInstruction = `${baseSystemInstruction}
Your entire output must be a single, valid JSON object with two keys: "response" (your in-character reply as a string) and "feedback" (an object with two keys: "linguistic" for grammatical/phrasing advice, and "fluency" for feedback on filler words, hesitations, and confidence). The fluency feedback is crucial.`;
  
  const proInterviewSystemInstruction = `You are an AI English coach and a tough but fair job interviewer named ${scenario.character}.
You are conducting a behavioral interview for a senior role. The user is the candidate.
Your goal is to challenge the user with follow-up questions and assess the quality of their answers based on a rubric of Communication, Clarity, and STAR method (Situation, Task, Action, Result).
Keep your in-character responses concise (1-3 sentences).
After your character's response, you MUST provide feedback in a JSON object. The object must have a "response" key (your reply as a string) and a "feedback" key (an object with "linguistic", "fluency", and "content" keys, where "content" assesses their answer's structure and quality).`;

  const freeSystemInstruction = `${baseSystemInstruction}
Your entire output must be a single, valid JSON object with two keys: "response" (your in-character reply as a string) and "feedback" (your coaching advice as a string).`;

  let systemInstruction = freeSystemInstruction;
  if(isPro) {
      if(scenario.id === 'behavioral-interview-pro') {
          systemInstruction = proInterviewSystemInstruction;
      } else {
          systemInstruction = proSystemInstruction;
      }
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction,
    }
  });

  chatStore[sessionId] = chat;
  return chat;
};

export const continueConversation = async (chat: Chat, userMessage: string): Promise<{ response: string; feedback: string | AdvancedConversationFeedback }> => {
  let rawText = '';
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message: userMessage });
    
    rawText = response.text.trim();
    if (!rawText) {
        throw new Error("Received empty response from AI.");
    }

    const cleanedText = rawText.replace(/^```json\s*|```$/g, '');
    const result = JSON.parse(cleanedText);

    if (typeof result !== 'object' || result === null) {
        throw new Error("Parsed JSON is not an object.");
    }
    
    const aiResponseText = result.response;
    if (typeof aiResponseText !== 'string' || !aiResponseText) {
        throw new Error("Missing or invalid 'response' key in JSON. Using raw text as fallback.");
    }

    const feedback = result.feedback;

    if (typeof feedback === 'object' && feedback !== null) {
         return {
            response: aiResponseText,
            feedback: {
                linguistic: feedback.linguistic || "No specific linguistic feedback.",
                fluency: feedback.fluency || "Your fluency was good!",
                content: result.content
            },
        };
    }

    return {
      response: aiResponseText,
      feedback: typeof feedback === 'string' ? feedback : "No specific feedback this time. Keep going!",
    };
  } catch (error) {
    console.error("Error continuing conversation:", error);
    
    if (rawText) {
      return {
        response: rawText,
        feedback: "The AI response was not in the expected format, so feedback is unavailable for this message.",
      };
    }

    return {
      response: "I seem to be having some trouble. Let's try that again.",
      feedback: "There was a technical issue. Please repeat your last sentence.",
    };
  }
};


export const getPronunciationFeedback = async (correctChunk: string, userTranscription: string): Promise<string> => {
    try {
        const prompt = `The user is practicing the English phrase: "${correctChunk}".
        They actually said: "${userTranscription}".
        Analyze the user's transcription for potential pronunciation issues compared to the original phrase. Provide very brief, constructive feedback focusing on one or two key sounds or words. If the transcription is a very close match, just say "Excellent pronunciation!".
        Respond in plain text, max 1-2 sentences.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 } // low latency
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error getting pronunciation feedback:", error);
        return "Sorry, I couldn't process the feedback right now.";
    }
};

export const getDrillResponse = async (userMessage: string): Promise<string> => {
    try {
        const prompt = `You are a friendly AI conversation partner. The user said: "${userMessage}". 
        Give a very short, natural, encouraging response to keep the conversation flowing. 
        Do not give feedback. Maximum one sentence.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 } // ultra-low latency for rapid drills
            }
        });

        return response.text || "That's interesting! What's next?";
    } catch (error) {
        console.error("Error getting drill response:", error);
        return "Let's keep going!";
    }
};

export const getAdvancedPronunciationFeedback = async (correctChunk: string, userTranscription: string, targetSound?: string): Promise<AdvancedFeedback> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            overallScore: {
                type: Type.INTEGER,
                description: "An overall score from 0 to 100 on how well the user pronounced the phrase, where 100 is perfect."
            },
            positiveFeedback: {
                type: Type.STRING,
                description: "A brief, encouraging comment on what the user did well."
            },
            improvementAreas: {
                type: Type.ARRAY,
                description: "A list of specific, problematic words or sounds.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: {
                            type: Type.STRING,
                            description: "The specific word or sound that needs improvement."
                        },
                        feedback: {
                            type: Type.STRING,
                            description: "A short, actionable tip on how to pronounce it better."
                        }
                    },
                    required: ['word', 'feedback']
                }
            },
            intonationFeedback: {
                type: Type.STRING,
                description: "Feedback on the user's intonation, rhythm, and stress compared to the correct phrase. For example, if they sounded robotic or if their pitch went up when it should have gone down."
            }
        },
        required: ['overallScore', 'positiveFeedback', 'improvementAreas', 'intonationFeedback']
    };

    try {
        const focusInstruction = targetSound
            ? `The user is specifically practicing the "${targetSound}" sound. Pay special attention to their pronunciation of this sound within the word/phrase. Your feedback in 'improvementAreas' should prioritize correcting this sound if it is mispronounced.`
            : '';

        const prompt = `You are a world-class English pronunciation and speech coach.
        The user is practicing this target phrase: "${correctChunk}"
        The user's attempt (transcribed from their speech) was: "${userTranscription}"
        
        ${focusInstruction}

        Your task is to provide detailed, structured feedback on their pronunciation. Analyze their attempt against the target phrase for accuracy of sounds, word stress, and overall intonation.
        
        Provide your feedback in a JSON format that adheres to the provided schema.
        - The 'overallScore' should be an integer from 0-100. Be critical but fair. A perfect match is 100. A completely different sentence is 0.
        - The 'positiveFeedback' should be a single encouraging sentence.
        - The 'improvementAreas' should list specific, actionable points. If pronunciation is perfect, this can be an empty array.
        - The 'intonationFeedback' should comment on the melody and rhythm of the speech.
        
        If the user's transcription is empty or completely unintelligible, provide a low score and appropriate feedback.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        const parsedFeedback = JSON.parse(jsonText) as AdvancedFeedback;
        return parsedFeedback;

    } catch (error) {
        console.error("Error getting advanced pronunciation feedback:", error);
        // Return a default error feedback object that matches the type
        return {
            overallScore: 0,
            positiveFeedback: "Sorry, an error occurred while generating feedback.",
            improvementAreas: [],
            intonationFeedback: "Could not analyze intonation due to a technical issue."
        };
    }
};

const formatHistoryForGrounding = (history: ChatMessage[]) => {
    let formattedHistory = "";
    history.forEach(msg => {
        formattedHistory += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}\n`;
    });
    return formattedHistory;
};

export const generateGroundedResponse = async (history: ChatMessage[], latestUserMessage: string, topic: string): Promise<{ text: string, sources: GroundingSource[]}> => {
    try {
        const fullHistory = [...history, { sender: 'user' as const, text: latestUserMessage }];
        const contents = formatHistoryForGrounding(fullHistory);

        const systemInstruction = `You are an AI English coach discussing the topic: "${topic}". Your goal is to have a natural, informative conversation with the user, helping them practice English. Use the provided search results to answer questions and stay on topic. Keep your responses conversational and concise (2-4 sentences). Do not provide separate feedback, just talk.`;

        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: contents,
           config: {
             systemInstruction,
             tools: [{googleSearch: {}}],
           },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map(chunk => chunk.web)
            .filter((web): web is { uri: string; title: string; } => !!web?.uri) || [];

        return {
            text: response.text,
            sources: sources
        };
    } catch(error) {
        console.error("Error generating grounded response:", error);
        return {
            text: "I'm sorry, I'm having trouble accessing information on that topic right now. Let's try another one.",
            sources: []
        };
    }
};

export const translateToVietnamese = async (text: string): Promise<string> => {
    try {
        const prompt = `Translate the following English text to Vietnamese. Only return the translated text, nothing else.\n\nEnglish: "${text}"\n\nVietnamese:`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0, // for more deterministic translations
                thinkingConfig: { thinkingBudget: 0 } // low latency
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error translating to Vietnamese:", error);
        return "Dịch thuật thất bại."; // Return error in Vietnamese
    }
};
