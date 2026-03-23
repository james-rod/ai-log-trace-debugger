import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

async function main() {
  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
  });

  const res = await llm.invoke("Say hello in one short sentence.");
  console.log(res.content);
}

main().catch((err) => {
  console.error("TEST ERROR:", err);
  process.exit(1);
});
