import { NextRequest, NextResponse } from 'next/server'
import {
  isServiceTitanConfigured,
  getServiceTitanConfigStatus
} from '@/lib/servicetitan-discount'
import { serviceTitanFetch } from '@/lib/servicetitan/client'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to check ServiceTitan API configuration status
 * Returns which environment variables are present (without exposing values)
 *
 * GET /api/discount/debug
 * GET /api/discount/debug?liveTest=true  — makes actual API call and returns raw response
 */
export async function GET(request: NextRequest) {
  const configStatus = getServiceTitanConfigStatus()
  const isConfigured = isServiceTitanConfigured()

  // Build list of missing variables
  const missing: string[] = []
  if (!configStatus.hasClientId) missing.push('SERVICETITAN_CLIENT_ID')
  if (!configStatus.hasClientSecret) missing.push('SERVICETITAN_CLIENT_SECRET')
  if (!configStatus.hasTenantId) missing.push('SERVICETITAN_TENANT_ID')
  if (!configStatus.hasAppKey) missing.push('SERVICETITAN_APP_KEY')

  // Build list of present variables
  const present: string[] = []
  if (configStatus.hasClientId) present.push('SERVICETITAN_CLIENT_ID')
  if (configStatus.hasClientSecret) present.push('SERVICETITAN_CLIENT_SECRET')
  if (configStatus.hasTenantId) present.push('SERVICETITAN_TENANT_ID')
  if (configStatus.hasAppKey) present.push('SERVICETITAN_APP_KEY')

  // Live test: make actual API call to see raw response
  const liveTest = request.nextUrl.searchParams.get('liveTest') === 'true'
  let liveTestResult: Record<string, unknown> | null = null

  if (liveTest && isConfigured) {
    try {
      const today = new Date()
      const endDate = new Date()
      endDate.setDate(today.getDate() + 3)

      const startsOnOrAfter = today.toISOString()
      const endsOnOrBefore = endDate.toISOString()

      const endpoint = `/dispatch/v2/tenant/{tenantId}/capacity`

      const requestBody = {
        startsOnOrAfter,
        endsOnOrBefore,
        skillBasedAvailability: false,
        args: {},
      }

      const rawResponse = await serviceTitanFetch<any>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      )

      const topLevelKeys = rawResponse && typeof rawResponse === 'object'
        ? Object.keys(rawResponse)
        : []

      // Find the first array in the response to inspect item structure
      let firstItemKeys: string[] | null = null
      let firstItemSample: unknown = null
      let arraySource: string | null = null

      for (const key of ['data', 'items', 'results', 'capacities']) {
        if (Array.isArray(rawResponse?.[key]) && rawResponse[key].length > 0) {
          firstItemKeys = typeof rawResponse[key][0] === 'object'
            ? Object.keys(rawResponse[key][0])
            : null
          firstItemSample = rawResponse[key][0]
          arraySource = key
          break
        }
      }

      // Check if root response is an array
      if (!arraySource && Array.isArray(rawResponse) && rawResponse.length > 0) {
        firstItemKeys = typeof rawResponse[0] === 'object'
          ? Object.keys(rawResponse[0])
          : null
        firstItemSample = rawResponse[0]
        arraySource = '(root array)'
      }

      liveTestResult = {
        success: true,
        request: {
          endpoint,
          method: 'POST',
          body: requestBody,
        },
        rawResponse,
        topLevelKeys,
        arraySource,
        firstItemKeys,
        firstItemSample,
        arrayLength: arraySource && arraySource !== '(root array)'
          ? rawResponse?.[arraySource]?.length
          : Array.isArray(rawResponse) ? rawResponse.length : null,
      }
    } catch (error) {
      liveTestResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      }
    }
  } else if (liveTest && !isConfigured) {
    liveTestResult = {
      success: false,
      error: 'Cannot run live test: ServiceTitan API not configured',
    }
  }

  return NextResponse.json({
    isConfigured,
    environment: configStatus.environment,
    variables: {
      present,
      missing,
      details: {
        SERVICETITAN_CLIENT_ID: configStatus.hasClientId
          ? `Set (starts with: ${configStatus.clientIdPreview}...)`
          : 'NOT SET or empty',
        SERVICETITAN_CLIENT_SECRET: configStatus.hasClientSecret
          ? 'Set (hidden)'
          : 'NOT SET or empty',
        SERVICETITAN_TENANT_ID: configStatus.hasTenantId
          ? `Set (starts with: ${configStatus.tenantIdPreview}...)`
          : 'NOT SET or empty',
        SERVICETITAN_APP_KEY: configStatus.hasAppKey
          ? `Set (starts with: ${configStatus.appKeyPreview}...)`
          : 'NOT SET or empty',
        SERVICETITAN_ENV: configStatus.environment,
      },
    },
    diagnosis: isConfigured
      ? 'All required environment variables are configured. ServiceTitan API should work.'
      : `Missing ${missing.length} required variable(s): ${missing.join(', ')}. ` +
        'Please ensure these are set in your Vercel environment variables and redeploy.',
    hints: !isConfigured ? [
      'Environment variables added in Vercel require a redeploy to take effect',
      'Make sure variables are set for the correct environment (production/preview/development)',
      'Check that values are not empty or contain only whitespace',
      'Variable names are case-sensitive: SERVICETITAN_CLIENT_ID not servicetitan_client_id',
    ] : [],
    ...(liveTestResult && { liveTest: liveTestResult }),
    timestamp: new Date().toISOString(),
  })
}
