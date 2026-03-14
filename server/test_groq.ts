import Groq from "groq-sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "d:/MoveCare/server/.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testV() {
  try {
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const url = `data:image/png;base64,${dummyBase64}`;
    console.log("Testing with URL:", url);
    
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
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.5,
      max_tokens: 1024
    });

    console.log("SUCCESS:", completion.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("ERROR:");
    console.error(err.message);
    if(err.error) console.error(err.error);
  }
}

testV();
