import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config({ path: "d:/MoveCare/server/.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testV(modelName: string) {
  try {
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const url = `data:image/png;base64,${dummyBase64}`;
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is this?" },
            { type: "image_url", image_url: { url } }
          ]
        }
      ],
      model: modelName,
      temperature: 0.5,
      max_tokens: 100
    });

    console.log("SUCCESS for", modelName);
  } catch (err: any) {
    console.log("FAIL for", modelName, err.error?.message || err.message);
  }
}

async function run() {
  await testV("llama-3.2-11b-vision");
  await testV("llama-3.2-90b-vision");
  await testV("llama-3.2-11b-vision-preview"); // Multimodal vision model
}

run();
