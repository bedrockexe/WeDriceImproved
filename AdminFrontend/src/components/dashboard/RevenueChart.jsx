import React from 'react';
import { TrendingUp } from 'lucide-react';


export function RevenueChart({
  data
}) {
  const maxAmount = Math.max(...data.map(d => d.amount));
  return <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Revenue Overview
          </h3>
          <p className="text-sm text-gray-500 mt-1">Last 7 days performance</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-600">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">+12.5%</span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
        const percentage = item.amount / maxAmount * 100;
        return <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">{item.day}</span>
                <span className="text-gray-900 font-semibold">
                  ${item.amount.toFixed(0)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out" style={{
              width: `${percentage}%`
            }} />
              </div>
            </div>;
      })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Total Revenue</span>
          <span className="text-xl font-bold text-gray-900">
            ${data.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>;
}