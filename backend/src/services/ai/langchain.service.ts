// ← AI execution
import { ChatOpenAI } from "@langchain/openai";
import { buildTraceAnalysisPrompt } from "./promptTemplates";
import { z } from "zod";
import "dotenv/config";

const DiagnosisSchema = z.object({
  summary: z.string(),
  confidence: z.enum(["HIGH", "MED", "LOW"]),
  rootCauses: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      evidenceEventIndices: z.array(z.number()).default([]),
    }),
  ),
  fixes: z.array(z.string()),
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;

export async function analyzeTraceWithLLM(input: {
  traceId: string;
  traceName: string | null;
  metrics: any;
  events: any[];
}) {
  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    maxRetries: 1,
    // LangChain supports request timeouts via options; if your version supports it, keep this:
    timeout: 20000, // 20s
    // Also keep outputs short
    maxTokens: 700,
  });

  const structured = llm.withStructuredOutput(DiagnosisSchema, {
    name: "TraceDiagnosis",
    strict: true,
  });

  const prompt = buildTraceAnalysisPrompt(input);
  const diagnosis = await structured.invoke(prompt);

  return diagnosis as Diagnosis;
}
