'use client'

import { ParentDashboardBody } from '../parent-dashboard'

interface ParentPageProps {
  onSwitchToStudent: () => void
}

export function ParentPage({ onSwitchToStudent }: ParentPageProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">👨‍👩‍👧 Children Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Link your child&rsquo;s account and monitor their learning progress, achievements, and
          activity.
        </p>
      </div>
      <ParentDashboardBody onSwitchToStudent={onSwitchToStudent} />
    </div>
  )
}
