import { NextResponse } from 'next/server'
import { 
  isServiceTitanConfigured,
  getServiceTitanConfigStatus
} from '@/lib/servicetitan-discount'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to check ServiceTitan API configuration status
 * Returns which environment variables are present (without exposing values)
 * 
 * GET /api/discount/debug
 */
export async function GET() {
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
    timestamp: new Date().toISOString(),
  })
}
