// components/DashboardStats.tsx
import { Calendar, Clock, XCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  totalBookings: number | null
  upcomingBookings: number | null
  cancelledBookings: number | null
  totalSpent: number | null
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Total Bookings" 
        value={stats.totalBookings || 0} 
        icon={Calendar}
        description="All time bookings"
      />
      <StatCard 
        title="Upcoming Stays" 
        value={stats.upcomingBookings || 0} 
        icon={Clock}
        description="Future reservations"
      />
      <StatCard 
        title="Cancellations" 
        value={stats.cancelledBookings || 0} 
        icon={XCircle}
        description="Cancelled bookings"
      />
      <StatCard 
        title="Total Spent" 
        value={`$${stats.totalSpent?.toFixed(2) || '0.00'}`} 
        icon={TrendingUp}
        description="All time spending"
      />
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
  title: string
  value: number | string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}