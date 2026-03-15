import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config({ path: "d:/MoveCare/server/.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  try {
    const models = await groq.models.list();
    console.log(models.data.map((m: any) => m.id));
  } catch(e: any) {
    console.error(e.message);
  }
}

listModels();
