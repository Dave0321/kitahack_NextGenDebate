// DebateModerator Service
// Enforces debate rules, detects logical fallacies, and maintains argument quality
// Integrates with Gemini 2.0 for content safety and AI-powered moderation

import {
  QualityFlag,
  DebateMessage,
  ModerationResult,
} from '@/lib/models/moderation'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Filter } from 'bad-words'

interface ModerationContext {
  title: string
  description: string
  selectedSDG: string
  userStance: string // 'Pro' or 'Con' — needed to detect goalpost moving
}

export class DebateModerator {
  /**
   * Layer 2 (Fallback): bad-words library + relevancy check
   * Runs when Layer 1 (Gemini) fails or times out
   * TODO: Replace fallback with detoxify Python microservice for more accurate ML-based detection
   */
  // TODO: Replace fallback with detoxify Python microservice for more accurate ML-based detection
  private static fallbackCheck(
    message: string,
    context: ModerationContext
  ): ModerationResult {
    const filter = new Filter()

    // Layer 2a: Check for profanity using bad-words library
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

    // Layer 2b: Check for relevancy by comparing against topic keywords
    const stopWords = new Set([
      'the', 'a', 'is', 'are', 'of', 'and', 'or', 'to', 'in', 'that', 'this',
      'for', 'with', 'it', 'as', 'by', 'an'
    ])

    // Extract meaningful words from context
    const topicWords = new Set(
      [...context.title.toLowerCase().split(/\s+/),
       ...context.description.toLowerCase().split(/\s+/),
       ...context.selectedSDG.toLowerCase().split(/\s+/)]
        .filter(word => word.length > 0 && !stopWords.has(word))
    )

    // Extract meaningful words from message
    const messageWords = message
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0 && !stopWords.has(word))

    // Check overlap
    const relevantWordsFound = messageWords.filter(word => topicWords.has(word)).length

    // Warn as off-topic if there is no overlap with the debate topic/SDG
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

    // Otherwise: pass
    console.log('✅ Fallback Layer 2: Message passed checks')
    return {
      verdict: 'pass',
      violationType: '',
      feedback: '',
      suggestedCorrection: '',
      scoreImpact: 0,
      qualityFlags: [],
    }
  }

  /**
   * Checks incoming message against debate rules and quality standards
   *
   * @param message - The user's argument message
   * @param history - Complete debate message history for context
   * @param context - Debate context (topic, SDG, stance)
   * @returns ModerationResult with verdict and any feedback/flags
   *
   * Rule Categories:
   * - Hard (Safety): Hate speech, slurs → block, stop send, score 0 (AI-powered via Gemini)
   * - Hard (Relevancy): Off-topic vs title AND SDG → warn, user choice, score -10
   * - Soft (Fallacy): Ad Hominem, Strawman → pass, silently flag, score 0
   *
   * Notes:
   * - Relevancy must be checked against BOTH context.selectedSDG AND context.title/description
   * - Soft fallacy detection compares against the last item in history
   * - TODO: Pass to post-debate summary service for fallacy detection
   */
  static async checkRules(
    message: string,
    history: DebateMessage[], // TODO: Pass to post-debate summary service for fallacy detection
    context: ModerationContext
  ): Promise<ModerationResult> {
    // TODO: Expand to full history analysis for Strawman, Moving the Goalposts detection
    // TODO: Implement three-strikes escalation — cumulative warns may lead to auto-block

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY

    try {
      if (!apiKey) {
        throw new Error('Missing Gemini API key')
      }

      const client = new GoogleGenerativeAI(apiKey)
      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const systemPrompt = `You are a strict debate moderation system. Analyze the user's message and return ONLY a valid JSON object with no markdown, no explanation, no extra text.

The JSON must follow this exact structure:
{
  "verdict": "pass" | "warn" | "block",
  "violationType": string,
  "feedback": string,
  "suggestedCorrection": string,
  "scoreImpact": number,
  "qualityFlags": []
}

Debate topic: "${context.title}"
Description: "${context.description}"
SDG: "${context.selectedSDG}"
User stance: "${context.userStance}"

Rules:
- Safety: hate speech, slurs, or personal attacks targeting a person → verdict "block", scoreImpact 0, feedback explaining why
- Relevancy: completely unrelated to debate topic and SDG (be lenient, sub-points count as relevant) → verdict "warn", violationType "Off-topic", scoreImpact -10
- Everything else → verdict "pass", scoreImpact 0
- qualityFlags must always be an empty array []
- scoreImpact must be exactly 0 for pass and block, -10 for warn

Return ONLY the JSON. No markdown. No backticks. No explanation.`

      const timeoutMs = 5000

      const geminiCall = model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: `User message: "${message}"` }],
          },
        ],
        systemInstruction: systemPrompt,
      })

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini moderation timeout')), timeoutMs)
      )

      const result = await Promise.race([geminiCall, timeoutPromise])
      let text = result.response.text()

      // Strip any markdown backticks from the response before parsing
      text = text.replace(/```/g, '').trim()

      type GeminiResponse = {
        verdict: ModerationResult['verdict']
        violationType: string
        feedback: string
        suggestedCorrection: string
        scoreImpact: number
        qualityFlags: unknown
      }

      const parsed = JSON.parse(text) as GeminiResponse

      const scoreImpact =
        parsed.verdict === 'warn'
          ? -10
          : 0

      const moderationResult: ModerationResult = {
        verdict: parsed.verdict,
        violationType: parsed.violationType,
        feedback: parsed.feedback,
        suggestedCorrection: parsed.suggestedCorrection,
        scoreImpact,
        qualityFlags: [],
      }

      return moderationResult
    } catch (error) {
      console.warn('Gemini moderation unavailable, using fallback', error)
      return this.fallbackCheck(message, context)
    }
  }
}
