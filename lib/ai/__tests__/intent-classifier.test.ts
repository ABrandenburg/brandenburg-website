import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Anthropic SDK — must be a class since code uses `new Anthropic()`
const mockCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate }
  },
}))

import { classifyDripReply, type DripReplyIntent } from '../intent-classifier'

beforeEach(() => {
  vi.unstubAllEnvs()
  mockCreate.mockReset()
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key')
})

function mockClassifierResponse(intent: string) {
  mockCreate.mockResolvedValue({
    content: [{ type: 'text', text: intent }],
  })
}

describe('classifyDripReply', () => {
  const dripContext = 'Hi John, this is Chris from Brandenburg Plumbing.'

  describe('valid intents', () => {
    const validIntents: DripReplyIntent[] = [
      'POSITIVE', 'QUESTION', 'BOOKING', 'NEGATIVE', 'WRONG_NUMBER', 'IRRELEVANT',
    ]

    for (const intent of validIntents) {
      it(`returns ${intent} when classifier responds with ${intent}`, async () => {
        mockClassifierResponse(intent)
        const result = await classifyDripReply('some message', dripContext)
        expect(result).toBe(intent)
      })
    }
  })

  it('handles lowercase response from classifier', async () => {
    mockClassifierResponse('positive')
    const result = await classifyDripReply('yes please', dripContext)
    expect(result).toBe('POSITIVE')
  })

  it('handles mixed case response', async () => {
    mockClassifierResponse('Negative')
    const result = await classifyDripReply('no thanks', dripContext)
    expect(result).toBe('NEGATIVE')
  })

  it('handles whitespace in response', async () => {
    mockClassifierResponse('  BOOKING  ')
    const result = await classifyDripReply('I want to schedule', dripContext)
    expect(result).toBe('BOOKING')
  })

  it('defaults to POSITIVE for unknown intent', async () => {
    mockClassifierResponse('MAYBE')
    const result = await classifyDripReply('hmm', dripContext)
    expect(result).toBe('POSITIVE')
  })

  it('defaults to POSITIVE when API call fails', async () => {
    mockCreate.mockRejectedValue(new Error('API error'))
    const result = await classifyDripReply('hello', dripContext)
    expect(result).toBe('POSITIVE')
  })

  it('defaults to POSITIVE when response has no text block', async () => {
    mockCreate.mockResolvedValue({ content: [] })
    const result = await classifyDripReply('hello', dripContext)
    expect(result).toBe('POSITIVE')
  })

  it('passes customer message and drip context to the API', async () => {
    mockClassifierResponse('POSITIVE')
    await classifyDripReply('yes I need help', 'Follow-up drip message')

    expect(mockCreate).toHaveBeenCalledTimes(1)
    const callArgs = mockCreate.mock.calls[0][0]
    expect(callArgs.model).toContain('haiku')
    expect(callArgs.max_tokens).toBe(50)
    expect(callArgs.messages[0].content).toContain('yes I need help')
    expect(callArgs.messages[0].content).toContain('Follow-up drip message')
  })
})
