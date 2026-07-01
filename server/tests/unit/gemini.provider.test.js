import { describe, expect, it, vi } from 'vitest'
import { coachChatOutputSchema } from '../../src/modules/ai/ai.output.js'
import { createGeminiProvider, GeminiProviderError } from '../../src/modules/ai/gemini.provider.js'

const chatJsonSchema = {
  type: 'object',
  required: ['answer', 'suggestedActions'],
  properties: {
    answer: { type: 'string' },
    suggestedActions: { type: 'array', items: { type: 'string' } },
  },
}

function responseWith(value, finishReason = 'STOP') {
  return {
    data: {
      candidates: [
        {
          finishReason,
          content: { parts: [{ text: JSON.stringify(value) }] },
        },
      ],
    },
  }
}

describe('Gemini provider', () => {
  it('requests schema-constrained JSON and validates the response', async () => {
    const post = vi.fn().mockResolvedValue(
      responseWith({
        answer: 'Practice two focused graph problems, then review both attempts.',
        suggestedActions: ['Solve one 1200-rated graph problem.'],
      }),
    )
    const provider = createGeminiProvider({
      apiKey: 'test-key-that-must-stay-server-side',
      model: 'test-model',
      httpClient: { post },
    })

    const result = await provider.generateStructured({
      systemInstruction: 'Return grounded JSON only.',
      task: 'Coach this user.',
      input: { handle: 'fixture' },
      jsonSchema: chatJsonSchema,
      outputSchema: coachChatOutputSchema,
    })

    expect(result.answer).toContain('graph')
    expect(post).toHaveBeenCalledOnce()
    const [url, body, config] = post.mock.calls[0]
    expect(url).toContain('/v1beta/models/test-model:generateContent')
    expect(body.generationConfig).toMatchObject({
      responseMimeType: 'application/json',
      responseJsonSchema: chatJsonSchema,
      candidateCount: 1,
    })
    expect(body.safetySettings).toHaveLength(4)
    expect(JSON.stringify(body)).not.toContain('test-key-that-must-stay-server-side')
    expect(config.headers['x-goog-api-key']).toBe('test-key-that-must-stay-server-side')
  })

  it('rejects safety-blocked and invalid model output', async () => {
    const blockedProvider = createGeminiProvider({
      apiKey: 'test-key',
      httpClient: {
        post: vi.fn().mockResolvedValue(responseWith({}, 'SAFETY')),
      },
    })
    const invalidProvider = createGeminiProvider({
      apiKey: 'test-key',
      httpClient: {
        post: vi.fn().mockResolvedValue(responseWith({ answer: '', suggestedActions: [] })),
      },
    })
    const input = {
      systemInstruction: 'Return JSON.',
      task: 'Coach.',
      input: {},
      jsonSchema: chatJsonSchema,
      outputSchema: coachChatOutputSchema,
    }

    await expect(blockedProvider.generateStructured(input)).rejects.toMatchObject({
      code: 'GEMINI_RESPONSE_BLOCKED',
    })
    await expect(invalidProvider.generateStructured(input)).rejects.toMatchObject({
      code: 'GEMINI_INVALID_RESPONSE',
    })
  })

  it('does not expose upstream error details or credentials', async () => {
    const provider = createGeminiProvider({
      apiKey: 'very-secret-key',
      httpClient: {
        post: vi.fn().mockRejectedValue(new Error('upstream included very-secret-key')),
      },
    })

    try {
      await provider.generateStructured({
        systemInstruction: 'Return JSON.',
        task: 'Coach.',
        input: {},
        jsonSchema: chatJsonSchema,
        outputSchema: coachChatOutputSchema,
      })
      throw new Error('Expected provider failure')
    } catch (error) {
      expect(error).toBeInstanceOf(GeminiProviderError)
      expect(error.code).toBe('GEMINI_REQUEST_FAILED')
      expect(error.message).not.toContain('very-secret-key')
      expect(error.message).not.toContain('upstream included')
    }
  })
})
