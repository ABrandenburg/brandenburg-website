'use client'

import { HONEYPOT_FIELD_NAME } from '@/lib/spam-prevention/honeypot'

/**
 * Invisible honeypot field component
 *
 * Uses multiple CSS techniques to hide from humans:
 * - Position absolute with negative offset
 * - Zero opacity
 * - aria-hidden for screen readers
 * - tabIndex -1 to prevent tab navigation
 */
export function HoneypotField() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        opacity: 0,
        height: 0,
        width: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <label htmlFor={HONEYPOT_FIELD_NAME}>
        Leave this field empty
      </label>
      <input
        type="text"
        id={HONEYPOT_FIELD_NAME}
        name={HONEYPOT_FIELD_NAME}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  )
}
