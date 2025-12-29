import React from 'react';
import { Button } from '../dashboardui/Button';
import { Plus, Calendar, FileText, Settings } from 'lucide-react';
export function QuickActions() {
  return <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="primary" className="justify-start" leftIcon={<Plus className="w-4 h-4" />}>
          New Booking
        </Button>

        <Button variant="secondary" className="justify-start" leftIcon={<Calendar className="w-4 h-4" />}>
          View Calendar
        </Button>

        <Button variant="secondary" className="justify-start" leftIcon={<FileText className="w-4 h-4" />}>
          Generate Report
        </Button>

        <Button variant="secondary" className="justify-start" leftIcon={<Settings className="w-4 h-4" />}>
          Settings
        </Button>
      </div>
    </div>;
}