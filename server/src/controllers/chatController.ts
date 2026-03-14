import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define the system instruction to force the diagnostic medical persona
const SYSTEM_INSTRUCTION = `
You are HealthAI, an advanced medical diagnostic assistant for MoveCare.
Your core objective is to analyze the user's health problem by asking targeted questions, and then suggest a potential disease or condition.

Follow this strict protocol:
1. When the user states their initial problem or symptom, DO NOT immediately guess the disease.
2. Ask 4 to 5 highly relevant, specific follow-up questions to gather more context (e.g., duration, severity, accompanying symptoms, medical history).
3. Wait for the user to answer these questions.
4. ONLY AFTER you have gathered sufficient information from your 4-5 questions, analyze everything and tell the patient what disease or condition they most likely have.
5. Provide a clear, structured summary of your analysis and the suspected condition.
6. Always conclude your final analysis with a disclaimer that you are an AI and they must consult a real doctor for an official diagnosis.

Maintain a professional, empathetic, and clinical tone at all times.
`;

export const processChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { history, message } = req.body;

    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    // Initialize the SDK dynamically inside the request to ensure process.env is fully loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    // Use Gemini 2.5 Flash as it is explicitly supported by this API key
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Map the frontend chat history format to Gemini's expected Content format
    let formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Gemini strictly requires the history array to start with a 'user' role.
    // The frontend always initializes with a 'bot' welcome message, so we 
    // prepend a dummy user message to satisfy the API constraints without losing context.
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    // Start a chat session with the previous history
    const chatSession = model.startChat({
      history: formattedHistory,
    });

    // Send the new message to the model
    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    res.status(200).json({ reply: responseText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Failed to process chat with HealthAI', error: error.message });
  }
};
