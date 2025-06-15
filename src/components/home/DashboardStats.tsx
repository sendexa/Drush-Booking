// components/DashboardStats.tsx
interface Stats {
  totalBookings: number | null
  upcomingBookings: number | null
  cancelledBookings: number | null
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatCard 
        title="Total Bookings" 
        value={stats.totalBookings || 0} 
        icon="calendar" 
      />
      <StatCard 
        title="Upcoming Stays" 
        value={stats.upcomingBookings || 0} 
        icon="clock" 
      />
      <StatCard 
        title="Cancellations" 
        value={stats.cancelledBookings || 0} 
        icon="x-circle" 
      />
    </div>
  )
}

// StatCard component remains the same

// StatCard component remains the same

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
          <span className={`icon-${icon}`} aria-hidden="true"></span>
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}