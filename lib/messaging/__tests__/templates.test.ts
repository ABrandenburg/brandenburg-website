import { describe, it, expect } from 'vitest'
import {
  getSpeedToLeadMessage,
  renderTemplate,
  getFallbackMessage,
  TCPA_MESSAGES,
} from '../templates'

describe('getSpeedToLeadMessage', () => {
  describe('angi source', () => {
    it('includes first name when provided', () => {
      const msg = getSpeedToLeadMessage({ firstName: 'John', source: 'angi' })
      expect(msg).toContain('Hi John, this is Chris from Brandenburg Plumbing')
      expect(msg).toContain('Angi')
    })

    it('uses generic greeting without first name', () => {
      const msg = getSpeedToLeadMessage({ source: 'angi' })
      expect(msg).toContain('Hi, this is Chris from Brandenburg Plumbing')
    })

    it('includes service type when provided', () => {
      const msg = getSpeedToLeadMessage({ firstName: 'John', serviceType: 'water heater repair', source: 'angi' })
      expect(msg).toContain('for water heater repair')
    })

    it('includes STOP opt-out language', () => {
      const msg = getSpeedToLeadMessage({ source: 'angi' })
      expect(msg).toContain('Reply STOP to opt out')
    })
  })

  describe('thumbtack source', () => {
    it('includes Thumbtack reference', () => {
      const msg = getSpeedToLeadMessage({ firstName: 'Jane', source: 'thumbtack' })
      expect(msg).toContain('Thumbtack')
      expect(msg).toContain('Hi Jane')
    })

    it('includes STOP language', () => {
      const msg = getSpeedToLeadMessage({ source: 'thumbtack' })
      expect(msg).toContain('Reply STOP to opt out')
    })
  })

  describe('lsa source', () => {
    it('generates LSA message', () => {
      const msg = getSpeedToLeadMessage({ source: 'lsa' })
      expect(msg).toContain('received your request')
      expect(msg).toContain('Reply STOP to opt out')
    })
  })

  describe('website source', () => {
    it('references website', () => {
      const msg = getSpeedToLeadMessage({ source: 'website' })
      expect(msg).toContain('through our website')
    })
  })

  describe('inbound_sms source', () => {
    it('returns empty string (AI handles directly)', () => {
      const msg = getSpeedToLeadMessage({ source: 'inbound_sms' })
      expect(msg).toBe('')
    })
  })

  describe('unknown source (default)', () => {
    it('generates generic message', () => {
      const msg = getSpeedToLeadMessage({ source: 'unknown' })
      expect(msg).toContain('Thanks for reaching out')
      expect(msg).toContain('Reply STOP to opt out')
    })

    it('includes name and service in default', () => {
      const msg = getSpeedToLeadMessage({ firstName: 'Bob', serviceType: 'drain cleaning', source: 'other' })
      expect(msg).toContain('Hi Bob')
      expect(msg).toContain('for drain cleaning')
    })
  })
})

describe('renderTemplate', () => {
  it('replaces single merge field', () => {
    expect(renderTemplate('Hello {{first_name}}!', { first_name: 'John' }))
      .toBe('Hello John!')
  })

  it('replaces multiple merge fields', () => {
    const result = renderTemplate(
      '{{first_name}}, your {{service_type}} is scheduled',
      { first_name: 'Jane', service_type: 'AC repair' },
    )
    expect(result).toBe('Jane, your AC repair is scheduled')
  })

  it('keeps placeholder when no value provided', () => {
    expect(renderTemplate('Hi {{first_name}}', {})).toBe('Hi {{first_name}}')
  })

  it('keeps placeholder when value is undefined', () => {
    expect(renderTemplate('Hi {{first_name}}', { first_name: undefined }))
      .toBe('Hi {{first_name}}')
  })

  it('handles template with no placeholders', () => {
    expect(renderTemplate('No placeholders here', { first_name: 'John' }))
      .toBe('No placeholders here')
  })

  it('handles empty template', () => {
    expect(renderTemplate('', { first_name: 'John' })).toBe('')
  })

  it('replaces same field multiple times', () => {
    expect(renderTemplate('{{name}} and {{name}}', { name: 'Chris' }))
      .toBe('Chris and Chris')
  })
})

describe('getFallbackMessage', () => {
  it('returns a message with phone number', () => {
    const msg = getFallbackMessage()
    expect(msg).toContain('Brandenburg Plumbing')
    expect(msg).toContain('(512) 756-9847')
  })

  it('returns consistent value', () => {
    expect(getFallbackMessage()).toBe(getFallbackMessage())
  })
})

describe('TCPA_MESSAGES', () => {
  it('has STOP_CONFIRMED message', () => {
    expect(TCPA_MESSAGES.STOP_CONFIRMED).toContain('unsubscribed')
    expect(TCPA_MESSAGES.STOP_CONFIRMED).toContain('START')
  })

  it('has START_CONFIRMED message', () => {
    expect(TCPA_MESSAGES.START_CONFIRMED).toContain('re-subscribed')
    expect(TCPA_MESSAGES.START_CONFIRMED).toContain('STOP')
  })

  it('has HELP message', () => {
    expect(TCPA_MESSAGES.HELP).toContain('(512) 756-9847')
    expect(TCPA_MESSAGES.HELP).toContain('STOP')
  })
})
