import axios from 'axios'
import { env } from '../../config/env.js'

const MAX_PROMPT_CHARACTERS = 50_000
const MAX_RESPONSE_BYTES = 1_000_000

const safetySettings = [
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
].map((category) => ({ category, threshold: 'BLOCK_MEDIUM_AND_ABOVE' }))

export class GeminiProviderError extends Error {
  constructor(code, details = null) {
    super('Gemini could not produce a safe, valid response.')
    this.name = 'GeminiProviderError'
    this.code = code
    this.details = details
  }
}

function extractCandidateText(response) {
  const candidate = response?.data?.candidates?.[0]
  if (!candidate || candidate.finishReason === 'SAFETY') {
    throw new GeminiProviderError('GEMINI_RESPONSE_BLOCKED')
  }

  const text = candidate.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('')
    .trim()

  if (!text) throw new GeminiProviderError('GEMINI_EMPTY_RESPONSE')
  return text
}

export function createGeminiProvider({
  apiKey = env.GEMINI_API_KEY,
  baseUrl = env.GEMINI_API_BASE_URL,
  model = env.AI_MODEL?.trim() || 'gemini-3.5-flash',
  timeoutMs = env.AI_TIMEOUT_MS,
  maxOutputTokens = env.AI_MAX_OUTPUT_TOKENS,
  httpClient = axios,
} = {}) {
  const normalizedKey = apiKey?.trim()
  const normalizedModel = model.trim()

  return {
    name: 'gemini',
    model: normalizedModel,
    isEnabled() {
      return env.AI_PROVIDER === 'gemini' && Boolean(normalizedKey)
    },
    async generateStructured({ systemInstruction, task, input, jsonSchema, outputSchema }) {
      if (!normalizedKey) throw new GeminiProviderError('GEMINI_NOT_CONFIGURED')

      const serializedInput = JSON.stringify(input)
      if (serializedInput.length > MAX_PROMPT_CHARACTERS) {
        throw new GeminiProviderError('GEMINI_INPUT_TOO_LARGE')
      }

      try {
        const response = await httpClient.post(
          `${baseUrl}/v1beta/models/${encodeURIComponent(normalizedModel)}:generateContent`,
          {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [
              {
                role: 'user',
                parts: [{ text: `${task}\n\nINPUT_JSON:\n${serializedInput}` }],
              },
            ],
            generationConfig: {
              candidateCount: 1,
              temperature: 0.2,
              maxOutputTokens,
              responseMimeType: 'application/json',
              responseJsonSchema: jsonSchema,
            },
            safetySettings,
          },
          {
            timeout: timeoutMs,
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': normalizedKey,
            },
            maxBodyLength: MAX_PROMPT_CHARACTERS * 2,
            maxContentLength: MAX_RESPONSE_BYTES,
          },
        )

        const parsedJson = JSON.parse(extractCandidateText(response))
        return outputSchema.parse(parsedJson)
      } catch (error) {
        if (error instanceof GeminiProviderError) throw error
        if (error?.name === 'ZodError') {
          throw new GeminiProviderError(
            'GEMINI_INVALID_RESPONSE',
            error.issues?.map((issue) => ({
              path: issue.path.join('.'),
              code: issue.code,
              message: issue.message,
            })) || null,
          )
        }
        if (error instanceof SyntaxError) {
          throw new GeminiProviderError('GEMINI_INVALID_JSON')
        }
        const status = error?.response?.status || null
        const code =
          status === 429
            ? 'GEMINI_RATE_LIMITED'
            : status === 503 || (status != null && status >= 500)
              ? 'GEMINI_UNAVAILABLE'
              : 'GEMINI_REQUEST_FAILED'
        throw new GeminiProviderError(code, {
          status,
          transportCode: error?.code || null,
        })
      }
    },
  }
}

export const geminiProvider = createGeminiProvider()
export const geminiFallbackProvider = createGeminiProvider({
  model: env.AI_FALLBACK_MODEL?.trim() || 'gemini-3.1-flash-lite',
})
