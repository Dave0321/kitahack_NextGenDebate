// lib/utils/debate-moderator.ts

import { QualityFlag, DebateMessage, ModerationResult } from '@/lib/models/moderation'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Filter } from 'bad-words'

interface ModerationContext {
  title: string
  description: string
  selectedSDG: string
  userStance: string // 'Pro' or 'Con' — needed to detect goalpost moving
}

export const DEFAULT_MODERATOR_PROMPT = `You are a strict debate moderation system. Analyze the user's message and return ONLY a valid JSON object with no markdown, no explanation, no extra text.

The JSON must follow this exact structure:
{
  "verdict": "pass" | "warn" | "block",
  "violationType": string,
  "feedback": string,
  "suggestedCorrection": string,
  "scoreImpact": number,
  "qualityFlags": []
}

Rules:
- Safety: hate speech, slurs, or personal attacks targeting a person → verdict "block", scoreImpact 0, feedback explaining why
- Relevancy: completely unrelated to debate topic and SDG (be lenient, sub-points count as relevant) → verdict "warn", violationType "Off-topic", scoreImpact -10
- Everything else → verdict "pass", scoreImpact 0
- qualityFlags must always be an empty array []
- scoreImpact must be exactly 0 for pass and block, -10 for warn

Return ONLY the JSON. No markdown. No backticks. No explanation.`;

export class DebateModerator {
  private static fallbackCheck(
    message: string,
    context: ModerationContext
  ): ModerationResult {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      console.log('✅ Fallback Layer 2 (bad-words): Profanity detected')
      return {
        verdict: 'block',
        violationType: 'Hate Speech',
        feedback: 'Your message contains inappropriate language. Please keep the debate respectful.',
        suggestedCorrection: 'Please rephrase your argument without offensive language.',
        scoreImpact: 0,
        qualityFlags: [],
      }
    }

    const stopWords = new Set(['the', 'a', 'is', 'are', 'of', 'and', 'or', 'to', 'in', 'that', 'this', 'for', 'with', 'it', 'as', 'by', 'an'])
    const topicWords = new Set(
      [...context.title.toLowerCase().split(/\s+/), ...context.description.toLowerCase().split(/\s+/), ...context.selectedSDG.toLowerCase().split(/\s+/)]
        .filter(word => word.length > 0 && !stopWords.has(word))
    )
    const messageWords = message.toLowerCase().split(/\s+/).filter(word => word.length > 0 && !stopWords.has(word))
    const relevantWordsFound = messageWords.filter(word => topicWords.has(word)).length

    if (relevantWordsFound === 0) {
      console.log('✅ Fallback Layer 2 (relevancy): Off-topic detected')
      return {
        verdict: 'warn',
        violationType: 'Off-topic',
        feedback: 'Your message does not seem related to the debate topic.',
        suggestedCorrection: 'Try connecting your argument back to the main topic.',
        scoreImpact: -10,
        qualityFlags: [],
      }
    }

    console.log('✅ Fallback Layer 2: Message passed checks')
    return { verdict: 'pass', violationType: '', feedback: '', suggestedCorrection: '', scoreImpact: 0, qualityFlags: [] }
  }

  static async checkRules(
    message: string,
    history: DebateMessage[],
    context: ModerationContext
  ): Promise<ModerationResult> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY

    try {
      if (!apiKey) throw new Error('Missing Gemini API key')

      const client = new GoogleGenerativeAI(apiKey)
      
      const dynamicTemp = typeof window !== "undefined" 
        ? parseFloat(localStorage.getItem("admin_moderator_temperature") || "0.1") 
        : 0.1;

      const model = client.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: dynamicTemp
        }
      })

      const baseAdminPrompt = typeof window !== "undefined"
        ? localStorage.getItem("admin_moderator_prompt") || DEFAULT_MODERATOR_PROMPT
        : DEFAULT_MODERATOR_PROMPT;

      const systemPrompt = `${baseAdminPrompt}
      
Debate topic: "${context.title}"
Description: "${context.description}"
SDG: "${context.selectedSDG}"
User stance: "${context.userStance}"`;

      const timeoutMs = 5000
      const geminiCall = model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `User message: "${message}"` }] }],
        systemInstruction: systemPrompt,
      })

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini moderation timeout')), timeoutMs)
      )

      const result = await Promise.race([geminiCall, timeoutPromise])
      let text = result.response.text().replace(/```/g, '').replace(/^json/i, '').trim()

      type GeminiResponse = {
        verdict: ModerationResult['verdict']
        violationType: string
        feedback: string
        suggestedCorrection: string
        scoreImpact: number
        qualityFlags: unknown
      }

      const parsed = JSON.parse(text) as GeminiResponse
      const scoreImpact = parsed.verdict === 'warn' ? -10 : 0

      return {
        verdict: parsed.verdict,
        violationType: parsed.violationType || "",
        feedback: parsed.feedback || "",
        suggestedCorrection: parsed.suggestedCorrection || "",
        scoreImpact,
        qualityFlags: [],
      }
    } catch (error) {
      console.warn('Gemini moderation unavailable, using fallback', error)
      return this.fallbackCheck(message, context)
    }
  }
}