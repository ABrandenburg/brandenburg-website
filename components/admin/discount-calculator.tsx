'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CapacityStatusBadge } from './capacity-status-badge'
import { DiscountCard } from './discount-card'
import type { CapacityData, DiscountResult } from '@/lib/discount-calculator'
import { Calculator, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'

export function DiscountCalculator() {
  const [capacityData, setCapacityData] = useState<CapacityData | null>(null)
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(null)
  const [grossMargin, setGrossMargin] = useState('')
  const [isLoadingCapacity, setIsLoadingCapacity] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Fetch capacity status on mount
  useEffect(() => {
    fetchCapacityStatus()
  }, [])

  async function fetchCapacityStatus() {
    setIsLoadingCapacity(true)
    setError(null)
    
    try {
      const response = await fetch('/api/discount/capacity')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch capacity status')
      }
      
      setCapacityData(data.data)
      setIsDemoMode(data.isDemoMode || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch capacity status')
    } finally {
      setIsLoadingCapacity(false)
    }
  }

  async function calculateDiscount() {
    const margin = parseFloat(grossMargin.replace(/[^0-9.]/g, ''))
    
    if (isNaN(margin) || margin <= 0) {
      setError('Please enter a valid gross margin amount')
      return
    }

    setIsCalculating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/discount/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grossMargin: margin }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate discount')
      }
      
      setDiscountResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate discount')
    } finally {
      setIsCalculating(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '')
    setGrossMargin(value)
    // Clear previous result when input changes
    setDiscountResult(null)
  }

  function formatInputValue(value: string): string {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString('en-US')
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-700">
            <span className="font-semibold">Demo Mode:</span> ServiceTitan API is not configured. 
            Using simulated capacity data for demonstration.
          </div>
        </div>
      )}

      {/* Capacity Status Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Capacity Status</CardTitle>
              <CardDescription>
                Based on ServiceTitan availability for the next 3 days
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCapacityStatus}
              disabled={isLoadingCapacity}
            >
              {isLoadingCapacity ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCapacity ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : capacityData ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CapacityStatusBadge
                status={capacityData.status}
                availabilityPercent={capacityData.availabilityPercent}
              />
              <div className="text-sm text-slate-500">
                {capacityData.availableCapacity} of {capacityData.totalCapacity} slots available
              </div>
            </div>
          ) : (
            <div className="text-red-600">Unable to load capacity status</div>
          )}
        </CardContent>
      </Card>

      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculate Discount
          </CardTitle>
          <CardDescription>
            Enter the gross margin to calculate authorized discount limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label 
              htmlFor="grossMargin" 
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Gross Margin Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <input
                id="grossMargin"
                type="text"
                value={formatInputValue(grossMargin)}
                onChange={handleInputChange}
                placeholder="10,000"
                className="w-full pl-8 pr-4 py-3 text-lg border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={calculateDiscount}
            disabled={isCalculating || !grossMargin || !capacityData}
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Discount
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {discountResult && (
        <div className="animate-fade-in-up">
          <DiscountCard result={discountResult} />
        </div>
      )}
    </div>
  )
}
