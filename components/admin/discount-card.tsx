'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency, type DiscountResult } from '@/lib/discount-calculator'
import { ChevronDown, ChevronUp, AlertTriangle, Check, ShieldAlert } from 'lucide-react'

interface DiscountCardProps {
  result: DiscountResult
}

export function DiscountCard({ result }: DiscountCardProps) {
  const [showMaxDiscount, setShowMaxDiscount] = useState(false)

  // If busy, show warning instead of discount cards
  if (result.status === 'busy') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800">No Discounts Available</CardTitle>
              <CardDescription className="text-red-600">
                Capacity is currently below 20%
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            We are currently too busy to offer discounts. Please maintain full pricing
            to ensure we can serve all customers effectively.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Standard Discount Card */}
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 rounded-full">
                <Check className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-700 rounded-full">
                    Standard Discount
                  </span>
                </div>
                <CardDescription className="mt-1">
                  Frontline Authorization Limit
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-sky-700">
              {formatCurrency(result.standardDiscount)}
            </p>
            <p className="text-sm text-slate-500 mt-2">Maximum Discount Amount</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-center flex-1">
              <p className="text-sm text-slate-500">Original Margin</p>
              <p className="text-lg font-semibold text-slate-700">
                {formatCurrency(result.grossMargin)}
              </p>
            </div>
            <div className="text-slate-300 px-4">→</div>
            <div className="text-center flex-1">
              <p className="text-sm text-slate-500">Retained Margin</p>
              <p className="text-lg font-semibold text-emerald-600">
                {formatCurrency(result.standardRetainedMargin)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowMaxDiscount(!showMaxDiscount)}
      >
        {showMaxDiscount ? (
          <>
            <ChevronUp className="w-4 h-4 mr-2" />
            Hide Max Authorization
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            Show Max Authorization
          </>
        )}
      </Button>

      {/* Max Discount Card (Collapsible) */}
      <div
        className={cn(
          'transition-all duration-300 overflow-hidden',
          showMaxDiscount ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          {/* Warning Banner */}
          <div className="bg-orange-100 border-b border-orange-200 px-4 py-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              Manager Approval Required
            </span>
          </div>
          
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                    Maximum Discount
                  </span>
                </div>
                <CardDescription className="mt-1 text-orange-700">
                  Absolute Floor — Use Only to Close the Deal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-orange-700">
                {formatCurrency(result.maxDiscount)}
              </p>
              <p className="text-sm text-slate-500 mt-2">Maximum Discount Amount</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
              <div className="text-center flex-1">
                <p className="text-sm text-slate-500">Original Margin</p>
                <p className="text-lg font-semibold text-slate-700">
                  {formatCurrency(result.grossMargin)}
                </p>
              </div>
              <div className="text-slate-300 px-4">→</div>
              <div className="text-center flex-1">
                <p className="text-sm text-slate-500">Retained Margin</p>
                <p className="text-lg font-semibold text-amber-600">
                  {formatCurrency(result.maxRetainedMargin)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
