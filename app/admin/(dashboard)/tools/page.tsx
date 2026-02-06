import Link from 'next/link'
import { DiscountCalculator } from '@/components/admin/discount-calculator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, TrendingUp } from 'lucide-react'

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Tools & Automations
        </h1>
        <p className="text-slate-500 mt-1">
          Internal tools for managing discounts, pricing, and more.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Discount Calculator Section */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Discount Calculator
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Calculate authorized discount limits based on current capacity and gross margin.
            </p>
          </div>
          
          <div className="max-w-2xl">
            <DiscountCalculator />
          </div>
        </div>

        {/* Scorecard Section */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Technician Scorecard
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              View technician performance rankings and company-wide KPIs.
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
            <Link href="/admin/tools/scorecard">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Performance Rankings</CardTitle>
                    <CardDescription className="text-sm">
                      Revenue, close rates, and technician metrics
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Technician rankings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Trend analysis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

          </div>
        </div>
      </div>
    </div>
  )
}
