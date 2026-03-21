/**
 * Utilities for testing Next.js API route handlers
 */

/**
 * Create a mock NextRequest for testing route handlers.
 * For POST requests with JSON body, pass the body as an object.
 * For POST requests with form data, pass body as URLSearchParams string.
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    contentType?: string
  } = {},
) {
  const { method = 'GET', body, headers = {}, contentType } = options

  const requestInit: RequestInit = {
    method,
    headers: {
      ...headers,
    },
  }

  if (body !== undefined && method !== 'GET') {
    if (contentType === 'application/x-www-form-urlencoded') {
      requestInit.body = body as string
      ;(requestInit.headers as Record<string, string>)['content-type'] = 'application/x-www-form-urlencoded'
    } else {
      requestInit.body = JSON.stringify(body)
      ;(requestInit.headers as Record<string, string>)['content-type'] = 'application/json'
    }
  }

  return new Request(url, requestInit)
}
